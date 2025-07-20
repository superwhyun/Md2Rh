"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus, Copy } from "lucide-react"
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

  const handleCreateStyle = () => {
    if (!newStyleName.trim()) return

    const newStyle = createNewStyle(newStyleName.trim())
    const updatedStyles = [...styles, newStyle]
    onStylesUpdate(updatedStyles)
    onStyleSelect(newStyle.id)
    setNewStyleName("")
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
      <div className="space-y-4">
        {!editingStyle ? (
          <>
            {/* 새 서식 생성 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">새 서식 생성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="서식 이름"
                  value={newStyleName}
                  onChange={(e) => setNewStyleName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleCreateStyle()}
                />
                <Button onClick={handleCreateStyle} disabled={!newStyleName.trim()} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  생성
                </Button>
              </CardContent>
            </Card>

            {/* 기존 서식 목록 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">기존 서식</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {styles.map((style) => (
                    <div
                      key={style.id}
                      className={`p-3 rounded-lg border ${
                        selectedStyleId === style.id ? "border-primary bg-primary/5" : "border-border"
                      }`}
                    >
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{style.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedStyleId === style.id ? "현재 선택됨" : "클릭하여 선택"}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onStyleSelect(style.id)}
                            disabled={selectedStyleId === style.id}
                            className="text-xs h-7"
                          >
                            선택
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setEditingStyle(style)} className="text-xs h-7">
                            편집
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDuplicateStyle(style)} className="text-xs h-7">
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStyle(style.id)}
                            disabled={styles.length <= 1}
                            className="text-xs h-7"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <StyleEditor style={editingStyle} onSave={handleStyleUpdate} onCancel={() => setEditingStyle(null)} onTempUpdate={handleTempStyleUpdate} />
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
            <Card>
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
          <StyleEditor style={editingStyle} onSave={handleStyleUpdate} onCancel={() => setEditingStyle(null)} onTempUpdate={handleTempStyleUpdate} />
        )}
      </DialogContent>
    </Dialog>
  )
}
