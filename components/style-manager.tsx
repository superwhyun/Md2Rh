"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Copy, Download, ArrowLeft, Save, RotateCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { type DocumentStyle, createNewStyle } from "@/lib/default-styles"
import { StyleEditor } from "@/components/style-editor"

interface StyleManagerProps {
  isOpen: boolean
  onClose: () => void
  styles: DocumentStyle[]
  onStylesUpdate: (styles: DocumentStyle[]) => void
  selectedStyleId: string
  onStyleSelect: (styleId: string) => void
  isSidebar?: boolean
  onTempStyleUpdate?: (style: DocumentStyle | null) => void
}

export function StyleManager({
  isOpen,
  onClose,
  styles,
  onStylesUpdate,
  selectedStyleId,
  onStyleSelect,
  isSidebar = false,
  onTempStyleUpdate,
}: StyleManagerProps) {
  const [editingStyle, setEditingStyle] = useState<DocumentStyle | null>(null)
  const [newStyleName, setNewStyleName] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)

  const handleCreateStyle = () => {
    if (!newStyleName.trim()) return

    const newStyle = createNewStyle(newStyleName.trim())
    const updatedStyles = [...styles, newStyle]
    onStylesUpdate(updatedStyles)
    onStyleSelect(newStyle.id)
    setNewStyleName("")
  }

  const handleDownloadStyle = (style: DocumentStyle) => {
    const dataStr = JSON.stringify(style, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${style.name}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        const importedStyle = JSON.parse(result) as DocumentStyle
        
        // 새 ID 할당하고 이름에 (가져옴) 추가
        const newStyle = {
          ...importedStyle,
          id: Date.now().toString(),
          name: `${importedStyle.name} (가져옴)`
        }
        
        const updatedStyles = [...styles, newStyle]
        onStylesUpdate(updatedStyles)
        onStyleSelect(newStyle.id)
      } catch (error) {
        alert('잘못된 JSON 파일입니다.')
      }
    }
    reader.readAsText(file)
  }

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
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'))
    
    if (jsonFile) {
      handleFileUpload(jsonFile)
    } else {
      alert('JSON 파일만 지원됩니다.')
    }
  }

  const handleDuplicateStyle = (style: DocumentStyle) => {
    const duplicatedStyle = {
      ...style,
      id: Date.now().toString(),
      name: `${style.name} (복사본)`,
    }
    const updatedStyles = [...styles, duplicatedStyle]
    onStylesUpdate(updatedStyles)
    onStyleSelect(duplicatedStyle.id)
  }

  const handleDeleteStyle = (styleId: string) => {
    if (styles.length <= 1) return // 최소 하나의 스타일은 유지

    const updatedStyles = styles.filter((style) => style.id !== styleId)
    onStylesUpdate(updatedStyles)

    if (selectedStyleId === styleId) {
      onStyleSelect(updatedStyles[0].id)
    }
  }

  const handleStyleUpdate = (updatedStyle: DocumentStyle) => {
    const updatedStyles = styles.map((style) => (style.id === updatedStyle.id ? updatedStyle : style))
    onStylesUpdate(updatedStyles)
  }

  const handleTempStyleUpdate = (updatedStyle: DocumentStyle) => {
    // 임시 업데이트만 전송 (실제 저장은 하지 않음)
    onTempStyleUpdate?.(updatedStyle)
  }

  const handleEditCancel = () => {
    setEditingStyle(null)
    onTempStyleUpdate?.(null) // 취소 시 임시 스타일 초기화
  }

  if (isSidebar) {
    return (
      <div className="space-y-3">
        {!editingStyle ? (
          <>
            {/* New Style Form */}
            <div 
              className={`space-y-2 p-3 rounded-lg border bg-card ${isDragOver ? 'border-primary bg-primary/5' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex gap-2">
                <Input
                  placeholder="새 서식 이름"
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateStyle()}
                  className="h-8 text-xs"
                />
                <Button onClick={handleCreateStyle} disabled={!newStyleName.trim()} size="sm" className="h-8 px-2">
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                JSON 파일을 여기에 드래그하여 가져오기
              </p>
            </div>

            {/* Style List */}
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground px-1">서식 목록</div>
              <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-auto">
                {styles.map((style) => (
                  <div
                    key={style.id}
                    className={`group p-2.5 rounded-md border transition-colors ${
                      selectedStyleId === style.id 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border/50 hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{style.name}</span>
                          {selectedStyleId === style.id && (
                            <span className="text-[10px] text-primary">사용중</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onStyleSelect(style.id)}
                          disabled={selectedStyleId === style.id}
                          className="h-6 w-6"
                        >
                          <span className="text-xs">✓</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setEditingStyle(style)} className="h-6 w-6">
                          <span className="text-xs">✎</span>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicateStyle(style)} className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadStyle(style)} className="h-6 w-6">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteStyle(style.id)}
                          disabled={styles.length <= 1}
                          className="h-6 w-6 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <StyleEditor style={editingStyle} onSave={handleStyleUpdate} onCancel={handleEditCancel} onTempUpdate={handleTempStyleUpdate} onRestore={handleStyleUpdate} />
        )}
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>문서 서식 관리자</DialogTitle>
        </DialogHeader>

        {!editingStyle ? (
          <div className="space-y-4">
            {/* 새 서식 생성 */}
            <Card 
              className={`transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CardHeader>
                <CardTitle className="text-lg">새 서식 생성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="서식 이름을 입력하세요"
                    value={newStyleName}
                    onChange={(e) => setNewStyleName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCreateStyle()}
                  />
                  <Button onClick={handleCreateStyle} disabled={!newStyleName.trim()}>
                    <Plus className="h-4 w-4 mr-2" />
                    생성
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground text-center border-t pt-3">
                  또는 JSON 파일을 여기에 드래그하세요
                </div>
              </CardContent>
            </Card>

            {/* 기존 서식 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">기존 서식</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {styles.map((style) => (
                    <div
                      key={style.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        selectedStyleId === style.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{style.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedStyleId === style.id ? "현재 선택됨" : "클릭하여 선택"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStyleSelect(style.id)}
                          disabled={selectedStyleId === style.id}
                        >
                          선택
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setEditingStyle(style)}>
                          편집
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDuplicateStyle(style)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadStyle(style)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStyle(style.id)}
                          disabled={styles.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <StyleEditor style={editingStyle} onSave={handleStyleUpdate} onCancel={handleEditCancel} onTempUpdate={handleTempStyleUpdate} onRestore={handleStyleUpdate} />
        )}
      </DialogContent>
    </Dialog>
  )
}
