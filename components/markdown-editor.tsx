"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Upload, FolderArchive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportToZip } from "@/lib/export-utils"
import { EditorToolbar } from "./editor-toolbar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StyleSelector } from "@/components/style-selector"
import type { DocumentStyle } from "@/lib/default-styles"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  title: string
  onTitleChange: (title: string) => void
  coverAuthor: string
  onCoverAuthorChange: (value: string) => void
  coverFooter: string
  onCoverFooterChange: (value: string) => void
  styles: DocumentStyle[]
  selectedStyleId: string
  onStyleSelect: (id: string) => void
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  title, 
  onTitleChange, 
  coverAuthor,
  onCoverAuthorChange,
  coverFooter, 
  onCoverFooterChange, 
  styles, 
  selectedStyleId, 
  onStyleSelect 
}: MarkdownEditorProps) {
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



  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    console.log('[Paste] Event triggered')
    
    if (!textareaRef.current) {
      console.log('[Paste] No textarea ref')
      return
    }

    const clipboardData = e.clipboardData
    if (!clipboardData) {
      console.log('[Paste] No clipboard data')
      return
    }

    console.log('[Paste] Types:', clipboardData.types)
    console.log('[Paste] Files:', clipboardData.files?.length)
    console.log('[Paste] Items:', clipboardData.items?.length)

    // items에서 이미지 찾기
    const items = clipboardData.items
    let imageItems: DataTransferItem[] = []
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        console.log(`[Paste] Item ${i}: type=${item.type}, kind=${item.kind}`)
        if (item.type.startsWith('image/')) {
          imageItems.push(item)
        }
      }
    }

    // files에서도 이미지 찾기 (fallback)
    const files = clipboardData.files
    let imageFiles: File[] = []
    
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`[Paste] File ${i}: type=${file.type}, name=${file.name}`)
        if (file.type.startsWith('image/')) {
          imageFiles.push(file)
        }
      }
    }

    // 이미지가 없으면 기본 동작 허용
    if (imageItems.length === 0 && imageFiles.length === 0) {
      console.log('[Paste] No images found, allowing default')
      return
    }

    // 이미지가 있으면 기본 붙여넣기 동작 방지
    e.preventDefault()
    console.log('[Paste] Images found, handling custom paste')

    const textarea = textareaRef.current
    let insertPosition = textarea.selectionStart ?? value.length

    // items에서 이미지 처리
    for (const item of imageItems) {
      const file = item.getAsFile()
      if (!file) continue

      console.log('[Paste] Processing item file:', file.name, file.type)

      // Blob URL 생성
      const blobUrl = URL.createObjectURL(file)
      
      // 파일명 생성
      const extension = file.type.split('/')[1] || 'png'
      const filename = file.name || `image_${Date.now()}.${extension}`
      
      const imageMarkdown = `![${filename}](${blobUrl})\n`
      console.log('[Paste] Inserting markdown:', imageMarkdown)

      // 현재 커서 위치에 이미지 삽입
      const currentValue = textarea.value
      const newValue = currentValue.slice(0, insertPosition) + imageMarkdown + currentValue.slice(insertPosition)
      onChange(newValue)

      // 다음 이미지를 위해 위치 업데이트
      insertPosition += imageMarkdown.length
    }

    // files에서 이미지 처리 (items에서 처리 못한 경우)
    for (const file of imageFiles) {
      // items에서 이미 처리했으면 스킵
      if (imageItems.length > 0) continue

      console.log('[Paste] Processing file:', file.name, file.type)

      const blobUrl = URL.createObjectURL(file)
      const extension = file.type.split('/')[1] || 'png'
      const filename = file.name || `image_${Date.now()}.${extension}`
      
      const imageMarkdown = `![${filename}](${blobUrl})\n`

      const currentValue = textarea.value
      const newValue = currentValue.slice(0, insertPosition) + imageMarkdown + currentValue.slice(insertPosition)
      onChange(newValue)

      insertPosition += imageMarkdown.length
    }

    // 커서 위치 업데이트
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = insertPosition
        textareaRef.current.selectionEnd = insertPosition
        textareaRef.current.focus()
      }
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Undo: Ctrl+Z
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault()
      onUndo?.()
      return
    }
    
    // Redo: Ctrl+Y or Ctrl+Shift+Z
    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
      e.preventDefault()
      onRedo?.()
      return
    }

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
      {/* Editor Header */}
      <div className="border-b bg-muted/30 shrink-0">
        {/* Editor Label Banner */}
        <div 
          className="border-b px-4 py-2 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%, #1e3a8a 100%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          <span 
            className="font-black uppercase tracking-[0.2em] text-white"
            style={{ 
              fontFamily: 'Impact, "Arial Black", "Helvetica Neue", sans-serif',
              fontSize: '24px',
              lineHeight: '1',
              textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.3)'
            }}
          >
            편집
          </span>
        </div>
        
        {/* Toolbar Row */}
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <TabsList className="h-9 p-1 bg-muted/50">
            <TabsTrigger 
              value="cover" 
              className="relative text-xs px-6 py-2 h-7 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 rounded-md transition-all"
            >
              표지
            </TabsTrigger>
            <TabsTrigger 
              value="main" 
              className="relative text-xs px-6 py-2 h-7 font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-border/50 rounded-md transition-all"
            >
              본문
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">스타일</span>
            <div className="w-[140px]">
              <StyleSelector styles={styles} selectedStyleId={selectedStyleId} onStyleSelect={onStyleSelect} />
            </div>
          </div>

          {/* ZIP Export Button */}
          <Button
            onClick={() => exportToZip(value, title, coverAuthor, coverFooter)}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <FolderArchive className="h-3.5 w-3.5" />
            ZIP 저장
          </Button>
        </div>
        
        {/* Format Toolbar - Only show in main tab */}
        <TabsContent value="main" className="mt-0">
          <EditorToolbar 
            onInsert={handleToolbarInsert} 
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </TabsContent>
      </div>

      {/* Cover Tab Content */}
      <TabsContent value="cover" className="flex-1 overflow-auto mt-0">
        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-medium text-foreground">
                문서 제목
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="제목을 입력하세요"
                className="h-9 bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="coverAuthor" className="text-xs font-medium text-foreground">
                작성자 정보
              </label>
              <p className="text-[10px] text-muted-foreground">작성자, 소속, 이메일 등을 기재</p>
              <Textarea
                id="coverAuthor"
                value={coverAuthor}
                onChange={(e) => onCoverAuthorChange(e.target.value)}
                placeholder="작성자: 홍길동
소속: 기획팀
이메일: example@company.com"
                className="min-h-[100px] font-mono text-xs resize-none whitespace-pre-wrap bg-background"
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="coverFooter" className="text-xs font-medium text-foreground">
                문서 개요
              </label>
              <p className="text-[10px] text-muted-foreground">문서에 대한 개요(Abstract) 기재</p>
              <Textarea
                id="coverFooter"
                value={coverFooter}
                onChange={(e) => onCoverFooterChange(e.target.value)}
                placeholder="본 문서는..."
                className="min-h-[120px] font-mono text-xs resize-none whitespace-pre-wrap bg-background"
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Main Content Tab */}
      <TabsContent value="main" className="flex-1 flex flex-col h-full mt-0 overflow-hidden relative">
        <div
          className="flex-1 p-3 relative overflow-hidden flex flex-col"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="# 제목을 입력하세요&#10;&#10;여기에 마크다운을 작성하세요..."
            className="h-full resize-none font-mono text-sm flex-1 leading-relaxed bg-[#fafafa] dark:bg-[#1a1a1a] border-muted-foreground/20 focus:bg-background transition-colors"
            spellCheck={false}
          />

          {isImageDragOver && (
            <>
              <div className="absolute inset-3 border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-1">🖼️</div>
                  <p className="text-sm font-medium text-primary">이미지 드롭</p>
                  <p className="text-xs text-muted-foreground">커서 위치에 삽입됩니다</p>
                </div>
              </div>
            </>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
