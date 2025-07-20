"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const markdownFile = files.find((file) => file.name.endsWith(".md") || file.name.endsWith(".markdown"))

    if (markdownFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onChange(content)
      }
      reader.readAsText(markdownFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.name.endsWith(".md") || file.name.endsWith(".markdown"))) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        onChange(content)
      }
      reader.readAsText(file)
    }
  }


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault()

      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      if (e.shiftKey) {
        // Shift+Tab: 들여쓰기 제거
        const lines = value.split("\n")
        const startLine = value.substring(0, start).split("\n").length - 1
        const endLine = value.substring(0, end).split("\n").length - 1

        let newValue = ""
        let newStart = start
        const newEnd = end
        let removedChars = 0

        lines.forEach((line, index) => {
          if (index >= startLine && index <= endLine) {
            if (line.startsWith("    ")) {
              // 4개 스페이스 제거
              const newLine = line.substring(4)
              newValue += newLine
              if (index === startLine) newStart = Math.max(0, start - 4)
              if (index <= endLine) removedChars += 4
            } else if (line.startsWith("\t")) {
              // 탭 문자 제거
              const newLine = line.substring(1)
              newValue += newLine
              if (index === startLine) newStart = Math.max(0, start - 1)
              if (index <= endLine) removedChars += 1
            } else {
              newValue += line
            }
          } else {
            newValue += line
          }

          if (index < lines.length - 1) {
            newValue += "\n"
          }
        })

        onChange(newValue)

        // 커서 위치 복원
        setTimeout(() => {
          textarea.selectionStart = newStart
          textarea.selectionEnd = Math.max(newStart, end - removedChars)
        }, 0)
      } else {
        // Tab: 들여쓰기 추가 (4칸)
        if (start === end) {
          // 커서만 있는 경우
          const newValue = value.substring(0, start) + "    " + value.substring(end)
          onChange(newValue)

          // 커서 위치 조정
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 4
          }, 0)
        } else {
          // 텍스트가 선택된 경우 - 선택된 모든 줄에 들여쓰기 추가 (4칸)
          const selectedText = value.substring(start, end)
          const lines = selectedText.split("\n")
          const indentedLines = lines.map((line) => "    " + line)
          const indentedText = indentedLines.join("\n")

          const newValue = value.substring(0, start) + indentedText + value.substring(end)
          onChange(newValue)

          // 선택 영역 조정
          setTimeout(() => {
            textarea.selectionStart = start
            textarea.selectionEnd = start + indentedText.length
          }, 0)
        }
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <h2 className="font-semibold">마크다운 에디터</h2>
        <p className="text-sm text-muted-foreground">마크다운을 입력하거나 .md 파일을 드래그앤드롭하세요</p>
      </div>

      <div
        className="flex-1 p-4 relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="여기에 마크다운을 입력하세요..."
          className="h-full resize-none font-mono text-sm"
        />

        {isDragOver && (
          <div className="absolute inset-4 border-2 border-dashed border-primary bg-primary/5 rounded-lg flex items-center justify-center">
            <Card className="p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">마크다운 파일을 여기에 놓으세요</p>
              <p className="text-sm text-muted-foreground">.md 또는 .markdown 파일</p>
            </Card>
          </div>
        )}

        <input ref={fileInputRef} type="file" accept=".md,.markdown" onChange={handleFileSelect} className="hidden" />
      </div>
    </div>
  )
}
