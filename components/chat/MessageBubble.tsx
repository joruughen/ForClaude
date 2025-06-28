"use client"

import type { Message } from "@/lib/types"
import Image from "next/image"
import type React from "react" // Import React to declare JSX

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user"

  // Function to process inline Markdown (bold, italic, code, etc.)
  const processInlineMarkdown = (text: string) => {
    const patterns = [
      {
        name: "bold",
        regex: /\*\*((?!\*)(.*?))\*\*/g,
        component: (content: string, key: string) => (
          <strong key={key} className="font-bold text-black">
            {content}
          </strong>
        ),
      },
      {
        name: "italic",
        regex: /(?:\*(?!\*)([^*]+)\*|_([^_]+)_)/g,
        component: (content: string, key: string) => (
          <em key={key} className="italic">
            {content}
          </em>
        ),
      },
      {
        name: "code",
        regex: /`(.*?)`/g,
        component: (content: string, key: string) => (
          <code key={key} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {content}
          </code>
        ),
      },
    ]

    let result: (string | React.ReactElement)[] = [text] // Use React.ReactElement instead of JSX.Element
    let keyCounter = 0

    patterns.forEach((pattern) => {
      const newResult: (string | React.ReactElement)[] = []

      result.forEach((part) => {
        if (typeof part === "string") {
          const parts: (string | React.ReactElement)[] = []
          let lastIndex = 0
          let match

          pattern.regex.lastIndex = 0

          while ((match = pattern.regex.exec(part)) !== null) {
            if (match.index > lastIndex) {
              parts.push(part.slice(lastIndex, match.index))
            }

            if (pattern.name === "italic") {
              const content = match[1] || match[2]
              parts.push(pattern.component(content, `${pattern.name}-${keyCounter++}`))
            } else {
              parts.push(pattern.component(match[1], `${pattern.name}-${keyCounter++}`))
            }

            lastIndex = match.index + match[0].length
          }

          if (lastIndex < part.length) {
            parts.push(part.slice(lastIndex))
          }

          newResult.push(...(parts.length > 0 ? parts : [part]))
        } else {
          newResult.push(part)
        }
      })

      result = newResult
    })

    return result.length === 1 && typeof result[0] === "string" ? result[0] : result
  }

  const processMarkdownText = (text: string) => {
    const lines = text.split("\n")

    return lines.map((line, index) => {
      const trimmedLine = line.trim()

      // Headers
      if (trimmedLine.startsWith("### ")) {
        return (
          <h3 key={index} className="text-lg font-bold text-black mb-2 mt-4">
            {trimmedLine.replace("### ", "")}
          </h3>
        )
      }
      if (trimmedLine.startsWith("## ")) {
        return (
          <h2 key={index} className="text-xl font-bold text-black mb-3 mt-5">
            {trimmedLine.replace("## ", "")}
          </h2>
        )
      }
      if (trimmedLine.startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-bold text-black mb-4 mt-6">
            {trimmedLine.replace("# ", "")}
          </h1>
        )
      }

      // Lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        return (
          <li key={index} className="ml-6 list-decimal mb-2">
            {processInlineMarkdown(trimmedLine.replace(/^\d+\.\s/, ""))}
          </li>
        )
      }

      if (/^[-*+]\s/.test(trimmedLine)) {
        return (
          <li key={index} className="ml-6 list-disc mb-2">
            {processInlineMarkdown(trimmedLine.replace(/^[-*+]\s/, ""))}
          </li>
        )
      }

      // Regular paragraphs
      if (trimmedLine.length > 0) {
        return (
          <p key={index} className="mb-3 leading-relaxed">
            {processInlineMarkdown(trimmedLine)}
          </p>
        )
      }

      return <br key={index} />
    })
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] p-3 rounded-lg ${
          isUser ? "bg-black text-white" : "bg-gray-50 text-black border border-gray-200"
        }`}
      >
        {/* Image if present */}
        {message.imageUrl && (
          <div className="mb-2">
            <Image
              src={message.imageUrl || "/placeholder.svg"}
              alt="Uploaded image"
              width={200}
              height={150}
              className="rounded object-cover"
            />
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <div className="whitespace-pre-wrap">{message.content}</div>
        ) : (
          <div className="text-gray-800">{processMarkdownText(message.content)}</div>
        )}

        {/* Relevant works if present */}
        {message.relevantWorks && message.relevantWorks.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-600">Obras relacionadas:</p>
            {message.relevantWorks.map((work, index) => (
              <div key={index} className="bg-white rounded border border-gray-200 p-2">
                <h4 className="font-semibold text-sm">{work.titulo || work.name}</h4>
                <p className="text-xs text-gray-600">{work.artista || work.artist}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
