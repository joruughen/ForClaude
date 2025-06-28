import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"

/**
 * Tiempo máx. de ejecución de la función (Edge Function / Serverless)
 */
export const maxDuration = 30

// ✅ Punto de entrada del backend FastAPI
const BACKEND_BASE = "https://257c-45-236-45-57.ngrok-free.app"

export async function POST(req: Request) {
  // ---------------------------------------------------------------------------
  // 1️⃣ Se espera que el front envíe { messages: ChatMessage[] }
  // ---------------------------------------------------------------------------
  const { messages } = await req.json()

  try {
    // Último mensaje del visitante
    const ultimoMensaje = messages[messages.length - 1]?.content ?? ""

    // Historial sin el último mensaje (para dar contexto al backend)
    const message_history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role,
      content: msg.content,
    }))

    // -------------------------------------------------------------------------
    // 2️⃣ Llamada al backend FastAPI
    // -------------------------------------------------------------------------
    const backendResponse = await fetch(`${BACKEND_BASE}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Evita advertencia de ngrok en algunos navegadores
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        message: ultimoMensaje,
        message_history,
      }),
    })

    console.log("📡 Respuesta del backend - Status:", backendResponse.status)

    // -------------------------------------------------------------------------
    // 3️⃣ Convertimos la respuesta a JSON -o- texto si no es JSON
    // -------------------------------------------------------------------------
    let data: { response: string }

    const contentType = backendResponse.headers.get("content-type") ?? ""
    if (contentType.includes("application/json")) {
      data = await backendResponse.json()
    } else {
      // Si llega texto plano (o HTML de error) lo envolvemos
      const text = await backendResponse.text()
      data = { response: text }
    }

    console.log("✅ ÉXITO - Backend respondió:", data)

    // -------------------------------------------------------------------------
    // 4️⃣ Devolvemos un stream al cliente
    // -------------------------------------------------------------------------
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode((data.response ?? "") + "\n"))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    })
  } catch (error) {
    // -------------------------------------------------------------------------
    // 5️⃣ Fallback a DeepSeek en caso de error con el backend
    // -------------------------------------------------------------------------
    console.error("Error conectando al backend:", error)

    const deepseek = createOpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY!,
      baseURL: "https://api.deepseek.com",
    })

    const contextInfo = `
      INFORMACIÓN DEL MUSEO DE ARTE CONTEMPORÁNEO (MAC) LIMA:
      ZONAS DEL MUSEO:
      - Zona IAC: Alberga obras del Instituto de Arte Contemporáneo (1955-1972), pionero en difundir arte moderno europeo y estadounidense en Perú.
      
      OBRAS PRINCIPALES:
      - El mundo en llamas (Fernando Bryce): Instalación crítica sobre construcción histórica
      - Shao Kené 5 (Sara Flores): Arte Shipibo-Konibo contemporáneo
      - Retablo Ayacuchano (Joaquín López Antay): Sincretismo cultural peruano
      - Vertical celeste (Jorge Eduardo Eielson): Instalación inspirada en quipus andinos
    `

    const systemPrompt = `Eres “Arti”, asistente virtual del Museo de Arte Contemporáneo (MAC) Lima.
    Tienes información sobre las obras de la colección permanente y puedes ayudar a los visitantes.

    ${contextInfo}

    Responde de manera amigable y educativa, siempre relacionando las preguntas con el arte contemporáneo peruano.`

    try {
      const result = await streamText({
        model: deepseek("deepseek-chat"),
        system: systemPrompt,
        messages,
      })

      return result.toDataStreamResponse()
    } catch (deepSeekError) {
      console.error("Error en respuesta DeepSeek:", deepSeekError)
      return new Response(JSON.stringify({ error: "No se pudo procesar la respuesta correctamente." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }
}
