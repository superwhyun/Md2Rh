"use client"

import { useState, useEffect } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { StyleManager } from "@/components/style-manager"
import { StyleSelector } from "@/components/style-selector"
import { Button } from "@/components/ui/button"
import { Settings } from "lucide-react"
import { type DocumentStyle, getDefaultStyles } from "@/lib/default-styles"

export default function Home() {
  const [markdown, setMarkdown] = useState(`# 마크다운 문서 예제

이것은 **마크다운 문서 생성기**입니다.

## 주요 기능

- 실시간 미리보기
- 커스텀 서식 관리
- 드래그앤드롭 파일 업로드

### 코드 예제

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> 이것은 인용문입니다.

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

- 불릿 포인트 1
- 불릿 포인트 2
- 불릿 포인트 3
이것은 **마크다운 문서 생성기**입니다.

## 주요 기능

- 실시간 미리보기
- 커스텀 서식 관리
- 드래그앤드롭 파일 업로드

### 코드 예제

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> 이것은 인용문입니다.

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

- 불릿 포인트 1
- 불릿 포인트 2
- 불릿 포인트 3
`)

  const [styles, setStyles] = useState<DocumentStyle[]>([])
  const [selectedStyleId, setSelectedStyleId] = useState<string>("")
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false)
  const [tempStyle, setTempStyle] = useState<DocumentStyle | null>(null) // 실시간 편집을 위한 임시 스타일

  useEffect(() => {
    // 로컬스토리지에서 저장된 스타일 불러오기
    const savedStyles = localStorage.getItem("documentStyles")
    if (savedStyles) {
      const parsedStyles = JSON.parse(savedStyles)
      setStyles(parsedStyles)
      if (parsedStyles.length > 0) {
        setSelectedStyleId(parsedStyles[0].id)
      }
    } else {
      // 기본 스타일 설정
      const defaultStyles = getDefaultStyles()
      setStyles(defaultStyles)
      setSelectedStyleId(defaultStyles[0].id)
      localStorage.setItem("documentStyles", JSON.stringify(defaultStyles))
    }
  }, [])

  const handleStylesUpdate = (updatedStyles: DocumentStyle[]) => {
    setStyles(updatedStyles)
    localStorage.setItem("documentStyles", JSON.stringify(updatedStyles))
  }

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyleId(styleId)
    setTempStyle(null) // 새로운 스타일 선택 시 임시 스타일 초기화
  }

  const selectedStyle = tempStyle || styles.find((style) => style.id === selectedStyleId)

  return (
    <div className="h-screen flex flex-col">
      {/* 상단 툴바 */}
      <div className="border-b bg-background p-4 flex items-center gap-4">
        <Button variant="outline" onClick={() => setIsStyleManagerOpen(true)} className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          문서서식관리자
        </Button>

        <StyleSelector styles={styles} selectedStyleId={selectedStyleId} onStyleSelect={handleStyleSelect} />
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 서식 관리자 */}
        {isStyleManagerOpen && (
          <div className="w-80 border-r bg-background flex-shrink-0 overflow-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">문서 서식 관리자</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStyleManagerOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
              <StyleManager
                isOpen={true}
                onClose={() => {
                  setIsStyleManagerOpen(false)
                  setTempStyle(null) // 사이드바 닫을 때 임시 스타일 초기화
                }}
                styles={styles}
                onStylesUpdate={handleStylesUpdate}
                selectedStyleId={selectedStyleId}
                onStyleSelect={handleStyleSelect}
                isSidebar={true}
                onTempStyleUpdate={setTempStyle} // 실시간 업데이트를 위한 콜백
              />
            </div>
          </div>
        )}

        {/* 중앙 패널 - 마크다운 에디터 */}
        <div className={`${isStyleManagerOpen ? 'w-1/2' : 'w-1/2'} border-r flex flex-col overflow-hidden`}>
          <MarkdownEditor 
            value={markdown} 
            onChange={setMarkdown}
          />
        </div>

        {/* 오른쪽 패널 - 미리보기 */}
        <div className={`${isStyleManagerOpen ? 'w-1/2' : 'w-1/2'} flex flex-col overflow-hidden`}>
          <MarkdownPreview 
            markdown={markdown} 
            style={selectedStyle}
          />
        </div>
      </div>
    </div>
  )
}
