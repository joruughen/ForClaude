"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MessageCircle, Send, X, ArrowRight, Clock, MapPin, Palette, Camera, Settings } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type React from "react"
import type { Message } from "@/lib/types"
import { api } from "@/lib/api"
import { MessageBubble } from "@/components/chat/MessageBubble"
import { CameraCapture } from "@/components/chat/CameraCapture"

export default function MuseumApp() {
  const [showChat, setShowChat] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const obrasReales = [
    {
      titulo: "El mundo en llamas",
      artista: "Fernando Bryce",
      año: "2000s",
      tecnica: "Instalación (95 dibujos en tinta)",
      descripcion:
        "Crítica a la construcción histórica mediante reproducción de periódicos de la Segunda Guerra Mundial",
      imagen: "/obras/el-mundo-en-llamas.png",
      id: "obra-bryce",
    },
    {
      titulo: "Shao Kené 5",
      artista: "Sara Flores",
      año: "Contemporáneo",
      tecnica: "Pintura con pigmentos naturales (huito)",
      descripcion: "Reinterpretación contemporánea de diseños geométricos Shipibo-Konibo",
      imagen: "/obras/shao-kene-5.png",
      id: "obra-flores",
    },
    {
      titulo: "Retablo Ayacuchano",
      artista: "Joaquín López Antay",
      año: "1975",
      tecnica: "Escultura en madera con masa de papa",
      descripcion: "Representa sincretismo cultural con escenas religiosas y costumbristas",
      imagen: "/obras/retablo-ayacuchano.png",
      id: "obra-lopez-antay",
    },
    {
      titulo: "Vertical celeste",
      artista: "Jorge Eduardo Eielson",
      año: "Contemporáneo",
      tecnica: "Instalación (luz/arena)",
      descripcion: "Inspirado en quipus y astrología andina, conecta Alfa Centauro con herencia precolombina",
      imagen: "/obras/vertical-celeste.jpeg",
      id: "obra-eielson",
    },
  ]

  const preguntasRapidas = [
    "¿Qué obras hay en el museo?",
    "Cuéntame sobre Fernando Bryce",
    "¿Qué es el arte Shipibo-Konibo?",
    "¿Qué significa el Retablo Ayacuchano?",
  ]

  // Componente de animación de typing
  const TypingAnimation = () => (
    <div className="flex justify-start">
      <div className="max-w-[85%] p-3 rounded-lg bg-gray-50 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
          <span className="text-sm text-gray-600">Arti está escribiendo...</span>
        </div>
      </div>
    </div>
  )

  const sendTextMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Use existing API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (response.ok) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let fullResponse = ""

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            fullResponse += chunk
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullResponse || "Respuesta recibida",
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(`Error ${response.status}`)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje. Intenta de nuevo.",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const sendImageMessage = async (imageFile: File, customMessage: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: customMessage,
      createdAt: new Date(),
      imageUrl: URL.createObjectURL(imageFile),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", imageFile)
      formData.append("message", customMessage)

      const data = await api.chat.sendImage(formData)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "He analizado tu imagen.",
        createdAt: new Date(),
        relevantWorks: data.relevant_works || [],
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending image:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al analizar la imagen. Intenta de nuevo.",
        createdAt: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendTextMessage(input)
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
    sendTextMessage(question)
  }

  if (showChat) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-full mx-auto">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <Button
              variant="ghost"
              onClick={() => setShowChat(false)}
              className="flex items-center gap-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg p-2"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center relative">
                <span className="text-white font-bold text-lg">A</span>
                <div
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                  }`}
                ></div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-black">Arti</h1>
                <p className="text-xs text-gray-500">{isLoading ? "Escribiendo..." : "Guía Virtual MAC Lima"}</p>
              </div>
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg p-2"
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>

          {/* Chat Messages */}
          <div className="flex flex-col h-[calc(100vh-80px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-4 relative">
                    <span className="text-white font-bold text-xl">A</span>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-3">¡Hola! Soy Arti</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Tu guía virtual del Museo de Arte Contemporáneo. ¿En qué puedo ayudarte hoy?
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 mb-3">Preguntas rápidas:</p>
                    {preguntasRapidas.map((pregunta, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleQuickQuestion(pregunta)}
                        className="block w-full max-w-md mx-auto text-left text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2"
                        disabled={isLoading}
                      >
                        {pregunta}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {isLoading && <TypingAnimation />}
                </>
              )}
            </div>

            {/* Camera Modal */}
            {showCamera && <CameraCapture onCapture={sendImageMessage} onClose={() => setShowCamera(false)} />}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Pregúntame sobre las obras del museo..."
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  disabled={isLoading}
                  className="bg-gray-600 text-white hover:bg-gray-700 disabled:bg-gray-300 rounded-lg px-4 py-2"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg px-4 py-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <h1 className="text-3xl md:text-6xl lg:text-7xl font-black text-black mb-2 md:mb-4 tracking-tight">
            MUSEO DE{" "}
            <span className="block">
              ARTE <br className="hidden md:block" />
              CONTEMPORÁNEO
            </span>
          </h1>
          <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="w-12 md:w-16 h-0.5 bg-black"></div>
            <span className="text-lg md:text-xl font-bold text-black tracking-wider">LIMA</span>
            <div className="w-12 md:w-16 h-0.5 bg-black"></div>
          </div>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
            Conoce nuestra colección con Arti, tu guía virtual especializado
          </p>
        </div>

        <div className="mb-12 md:mb-16">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4">Obras de la colección</h2>
            <p className="text-gray-600 max-w-2xl mx-auto px-4">
              Arti conoce estas obras de nuestra colección permanente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {obrasReales.map((obra, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300 border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="aspect-video relative">
                  <Image src={obra.imagen || "/placeholder.svg"} alt={obra.titulo} fill className="object-cover" />
                </div>
                <CardHeader className="pb-3">
                  <h3 className="text-lg md:text-xl font-bold text-black mb-2">{obra.titulo}</h3>
                  <p className="text-gray-700 font-semibold">{obra.artista}</p>
                  <p className="text-sm text-gray-500">{obra.año}</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-2">{obra.tecnica}</p>
                  <p className="text-gray-600 text-sm">{obra.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Palette className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black mb-2">4</div>
            <div className="text-gray-600 text-sm md:text-base">Obras con información detallada</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black mb-2">Mar - Dom</div>
            <div className="text-gray-600 text-sm md:text-base">Horario de atención</div>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-black rounded-lg flex items-center justify-center mx-auto mb-3 md:mb-4">
              <MapPin className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-black mb-2">Barranco</div>
            <div className="text-gray-600 text-sm md:text-base">Distrito histórico de Lima</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4">¿Listo para explorar?</h2>
          <p className="text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            Comienza tu recorrido virtual con Arti. Descubre historias, técnicas y curiosidades de cada obra.
          </p>
          <Button
            onClick={() => setShowChat(true)}
            className="bg-black text-white hover:bg-gray-800 rounded-lg px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold inline-flex items-center gap-2 md:gap-3 transition-all duration-300 transform hover:scale-105"
          >
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
            Hablar con Arti
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-500 text-sm md:text-base border-t border-gray-200 pt-6 md:pt-8">
          <p>© 2024 Museo de Arte Contemporáneo Lima. Todos los derechos reservados.</p>
          <p className="mt-2">Av. Grau 1511, Barranco - Lima, Perú</p>
        </footer>
      </div>
    </div>
  )
}
