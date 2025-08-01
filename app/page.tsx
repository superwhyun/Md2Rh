"use client"

import { useState, useEffect } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { StyleManager } from "@/components/style-manager"
import { StyleSelector } from "@/components/style-selector"
import { Button } from "@/components/ui/button"
import { Settings, Github } from "lucide-react"
import { type DocumentStyle, getDefaultStyles } from "@/lib/default-styles"

export default function Home() {
  const [title, setTitle] = useState("")
  const [markdown, setMarkdown] = useState(`# 마크다운 문서 예제

이것은 **마크다운 문서 생성기**입니다.

## 주요 기능

- 실시간 미리보기
- 커스텀 서식 관리
- 드래그앤드롭 파일 업로드
- 이미지 드래그앤드롭 지원

### 코드 예제

\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

> 이것은 인용문입니다.

### 순서있는 목록

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

### 순서없는 목록

- **불릿 포인트 1**
- 불릿 포인트 2
- 불릿 포인트 3
- **굵은글씨** 테스트 항목
- **중요한 내용:**
    - 여기서 바보되더라니까
    - 어라?

- **Bold text** followed by normal text

**이제 마크다운을 편집하여 문서를 작성해보세요!**
`)

  const [styles, setStyles] = useState<DocumentStyle[]>([])
  const [selectedStyleId, setSelectedStyleId] = useState<string>("")
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false)
  const [tempStyle, setTempStyle] = useState<DocumentStyle | null>(null) // 실시간 편집을 위한 임시 스타일

  useEffect(() => {
    // 서버 기본 스타일과 로컬 커스텀 스타일 병합
    const defaultStyles = getDefaultStyles()
    const savedStyles = localStorage.getItem("documentStyles")
    
    let mergedStyles = [...defaultStyles]
    
    if (savedStyles) {
      const parsedStyles = JSON.parse(savedStyles) as DocumentStyle[]
      
      // 로컬 스타일을 순회하면서 병합
      parsedStyles.forEach(localStyle => {
        const existingIndex = mergedStyles.findIndex(style => style.id === localStyle.id)
        if (existingIndex >= 0) {
          // 같은 ID가 있으면 로컬 스타일로 교체 (우선순위)
          mergedStyles[existingIndex] = localStyle
        } else {
          // 새로운 커스텀 스타일이면 추가
          mergedStyles.push(localStyle)
        }
      })
    }
    
    console.log('Merged styles:', mergedStyles.map(s => s.name))
    setStyles(mergedStyles)
    setSelectedStyleId(mergedStyles[0].id)
    localStorage.setItem("documentStyles", JSON.stringify(mergedStyles))
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
        
        <div className="flex-1" />
        
        <Button variant="ghost" size="sm" asChild className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <a href="https://github.com/superwhyun/Md2Rh" target="_blank" rel="noopener noreferrer">
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </Button>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 왼쪽 사이드바 - 서식 관리자 */}
        {isStyleManagerOpen && (
          <div className="w-96 border-r bg-background flex-shrink-0 overflow-auto">
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

        {/* 중앙 패널 - 마크다운 에디터 (가변 크기) */}
        <div className="flex-1 border-r flex flex-col overflow-hidden min-w-0">
          <MarkdownEditor 
            value={markdown} 
            onChange={setMarkdown}
            title={title}
            onTitleChange={setTitle}
          />
        </div>

        {/* 오른쪽 패널 - 미리보기 (고정 크기) */}
        <div className="flex-shrink-0 flex flex-col overflow-hidden" style={{ width: '680px', minWidth: '680px', maxWidth: '680px' }}>
          <MarkdownPreview 
            markdown={markdown} 
            style={selectedStyle}
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
