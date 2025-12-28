"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Upload } from "lucide-react"
import { EditorToolbar } from "./editor-toolbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StyleSelector } from "@/components/style-selector"
import type { DocumentStyle } from "@/lib/default-styles"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  title: string
  onTitleChange: (title: string) => void
  coverFooter: string
  onCoverFooterChange: (value: string) => void
  styles: DocumentStyle[]
  selectedStyleId: string
  onStyleSelect: (id: string) => void
}

export function MarkdownEditor({ value, onChange, title, onTitleChange, coverFooter, onCoverFooterChange, styles, selectedStyleId, onStyleSelect }: MarkdownEditorProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isImageDragOver, setIsImageDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleToolbarInsert = (prefix: string, suffix: string = "", placeholder: string = "") => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let textToInsert = ""
    let newCursorPos = 0

    if (selectedText) {
      // 텍스트가 선택된 경우: 선택된 텍스트를 감싸거나 대체
      textToInsert = prefix + selectedText + suffix
      newCursorPos = start + textToInsert.length
    } else {
      // 텍스트가 선택되지 않은 경우: placeholder 삽입
      textToInsert = prefix + placeholder + suffix
      newCursorPos = start + prefix.length + placeholder.length // 커서는 placeholder 끝에 위치 (조정 가능)
      if (placeholder && suffix) {
        // placeholder가 있으면 커서를 placeholder 부분 선택하면 좋겠지만, 일단 뒤로 보냄.
        // suffix가 있으면 그 사이로 보내는게 나을수도.
        newCursorPos = start + prefix.length
      }
    }

    const newValue = value.substring(0, start) + textToInsert + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = newCursorPos
      textarea.selectionEnd = newCursorPos
    }, 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()

    const files = Array.from(e.dataTransfer.files || [])
    const hasImageFile = files.some(file => file.type.startsWith('image/'))

    // URL이나 HTML 데이터가 있는지 확인
    const hasImageData = e.dataTransfer.types.includes('text/uri-list') ||
      e.dataTransfer.types.includes('text/html') ||
      hasImageFile

    if (hasImageData) {
      setIsImageDragOver(true)
      setIsDragOver(false)
    } else {
      setIsDragOver(false)
      setIsImageDragOver(false)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setIsImageDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setIsImageDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    // 브라우저에서 드래그한 이미지 URL 처리
    const imageUrl = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain')
    const htmlData = e.dataTransfer.getData('text/html')

    if (imageFiles.length > 0) {
      // 이미지 파일들을 Blob URL로 변환하여 마크다운에 삽입
      imageFiles.forEach((file) => {
        const blobUrl = URL.createObjectURL(file)
        const imageMarkdown = `![${file.name}](${blobUrl})\n`

        console.log('Generated blob URL:', blobUrl)
        console.log('Generated markdown:', imageMarkdown)

        // 현재 커서 위치에 이미지 삽입
        const insertPosition = textareaRef.current?.selectionStart ?? value.length
        const newValue = value.slice(0, insertPosition) + imageMarkdown + value.slice(insertPosition)
        console.log('Insert position:', insertPosition, 'Total length:', value.length)
        onChange(newValue)

        // 커서 위치를 이미지 뒤로 이동
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPosition = insertPosition + imageMarkdown.length
            textareaRef.current.selectionStart = newCursorPosition
            textareaRef.current.selectionEnd = newCursorPosition
            textareaRef.current.focus()
          }
        }, 0)
      })
    } else if (imageUrl && (imageUrl.startsWith('http') || imageUrl.startsWith('data:'))) {
      // 브라우저에서 드래그한 이미지 URL 처리
      console.log('Dropped image URL:', imageUrl)

      // URL에서 파일명 추출 (없으면 기본값)
      let filename = 'image'
      try {
        const urlObj = new URL(imageUrl)
        const pathname = urlObj.pathname
        const lastSlash = pathname.lastIndexOf('/')
        if (lastSlash !== -1) {
          filename = pathname.substring(lastSlash + 1) || 'image'
        }
        // 확장자가 없으면 추가
        if (!filename.includes('.')) {
          filename += '.png'
        }
      } catch (e) {
        filename = 'image.png'
      }

      // 원격 이미지를 Blob으로 다운로드 시도
      try {
        console.log('Attempting to download remote image...')
        const response = await fetch(imageUrl)
        if (response.ok) {
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)
          const imageMarkdown = `![${filename}](${blobUrl})\n`
          console.log('Remote image converted to Blob URL:', blobUrl)

          // 현재 커서 위치에 이미지 삽입
          const insertPosition = textareaRef.current?.selectionStart ?? value.length
          const newValue = value.slice(0, insertPosition) + imageMarkdown + value.slice(insertPosition)
          onChange(newValue)

          // 커서 위치를 이미지 뒤로 이동
          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPosition = insertPosition + imageMarkdown.length
              textareaRef.current.selectionStart = newCursorPosition
              textareaRef.current.selectionEnd = newCursorPosition
              textareaRef.current.focus()
            }
          }, 0)

          return // 성공하면 여기서 종료
        }
      } catch (downloadError) {
        console.warn('Remote image download failed, using original URL:', downloadError)
      }

      // 다운로드 실패 시 원본 URL 사용
      const imageMarkdown = `![${filename}](${imageUrl})\n`

      // 현재 커서 위치에 이미지 삽입
      const insertPosition = textareaRef.current?.selectionStart ?? value.length
      const newValue = value.slice(0, insertPosition) + imageMarkdown + value.slice(insertPosition)
      onChange(newValue)

      // 커서 위치를 이미지 뒤로 이동
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = insertPosition + imageMarkdown.length
          textareaRef.current.selectionStart = newCursorPosition
          textareaRef.current.selectionEnd = newCursorPosition
          textareaRef.current.focus()
        }
      }, 0)
    } else if (htmlData) {
      // HTML에서 이미지 src 추출
      console.log('Dropped HTML data:', htmlData)
      const imgMatch = htmlData.match(/<img[^>]+src="([^"]+)"/i)
      if (imgMatch) {
        const imgSrc = imgMatch[1]
        console.log('Extracted image src:', imgSrc)

        let filename = 'image.png'
        try {
          const urlObj = new URL(imgSrc)
          const pathname = urlObj.pathname
          const lastSlash = pathname.lastIndexOf('/')
          if (lastSlash !== -1) {
            filename = pathname.substring(lastSlash + 1) || 'image.png'
          }
        } catch (e) {
          filename = 'image.png'
        }

        const imageMarkdown = `![${filename}](${imgSrc})\n`

        // 현재 커서 위치에 이미지 삽입
        const insertPosition = textareaRef.current?.selectionStart ?? value.length
        const newValue = value.slice(0, insertPosition) + imageMarkdown + value.slice(insertPosition)
        onChange(newValue)

        // 커서 위치를 이미지 뒤로 이동
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPosition = insertPosition + imageMarkdown.length
            textareaRef.current.selectionStart = newCursorPosition
            textareaRef.current.selectionEnd = newCursorPosition
            textareaRef.current.focus()
          }
        }, 0)
      }
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
    <Tabs defaultValue="main" className="h-full flex flex-col">
      <div className="bg-background border-b z-10 shrink-0 px-4 pt-4 pb-2">
        <div className="mb-4 flex items-center justify-end gap-3">
          <span className="text-sm font-semibold text-muted-foreground">스타일 선택</span>
          <div className="w-[200px]">
            <StyleSelector styles={styles} selectedStyleId={selectedStyleId} onStyleSelect={onStyleSelect} />
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="cover">Cover Page</TabsTrigger>
          <TabsTrigger value="main">Main Content</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="cover" className="flex-1 p-4 space-y-6 overflow-auto mt-0">
        <div className="space-y-4">
          <Card className="p-4 space-y-4 border-muted">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-foreground block">
                문서 제목 (Title)
              </label>
              <p className="text-xs text-muted-foreground">표지의 중앙에 크게 표시됩니다.</p>
              <Input
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="제목 없는 문서"
                className="font-bold text-lg"
              />
            </div>
          </Card>

          <Card className="p-4 space-y-4 border-muted">
            <div className="space-y-2">
              <label htmlFor="coverFooter" className="text-sm font-semibold text-foreground block">
                표지 하단 내용 (Footer Info)
              </label>
              <p className="text-xs text-muted-foreground">작성자, 작성일, 소속, 초록(Abstract) 등을 입력하세요. 마크다운 문법이 지원됩니다.</p>
              <Textarea
                id="coverFooter"
                value={coverFooter}
                onChange={(e) => onCoverFooterChange(e.target.value)}
                placeholder="예:&#13;&#10;**작성자**: 홍길동&#13;&#10;**부서**: 기획팀&#13;&#10;**날짜**: 2024.01.01"
                className="min-h-[200px] font-mono text-sm resize-none"
              />
            </div>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="main" className="flex-1 flex flex-col h-full mt-0 overflow-hidden relative">
        <div className="absolute inset-0 flex flex-col">
          <EditorToolbar onInsert={handleToolbarInsert} />

          <div
            className="flex-1 p-4 relative overflow-hidden flex flex-col"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="여기에 본문 마크다운을 입력하세요..."
              className="h-full resize-none font-mono text-sm flex-1"
            />

            {isImageDragOver && (
              <>
                <div className="absolute inset-4 border-2 border-dashed border-green-500 bg-green-50/30 rounded-lg pointer-events-none">
                </div>
                <div className="absolute top-6 right-6 pointer-events-none">
                  <Card className="p-3 text-center bg-green-50 border-green-200">
                    <div className="h-6 w-6 mx-auto mb-1 text-green-600">🖼️</div>
                    <p className="text-xs font-medium text-green-700">이미지 드롭</p>
                    <p className="text-xs text-green-500">커서 위치에 삽입</p>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
