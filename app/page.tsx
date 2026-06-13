"use client"

import { useState, useEffect, useCallback } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { StyleManager } from "@/components/style-manager"
// import { StyleSelector } from "@/components/style-selector" // Moved to MarkdownEditor
import { HelpModal } from "@/components/help-modal"
import { Button } from "@/components/ui/button"
import { Github, HelpCircle, FileText, LayoutTemplate } from "lucide-react"
import { type DocumentStyle, getDefaultStyles } from "@/lib/default-styles"
import { ModeToggle } from "@/components/mode-toggle"
import { ThemeSelector } from "@/components/theme-selector"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

// Undo/Redo history state
interface HistoryState {
  past: string[]
  present: string
  future: string[]
}

export default function Home() {
  const [title, setTitle] = useState("Md2Rh 서비스 사용 매뉴얼")
  const [markdown, setMarkdown] = useState(`# Md2Rh 서비스 사용 매뉴얼

이 문서는 Md2Rh 사이트의 실제 사용 흐름을 기준으로 작성된 상세 가이드입니다.  
처음 사용하는 사용자도 아래 순서대로 따라 하면 문서 작성부터 PDF/DOCX/ZIP 내보내기까지 완료할 수 있습니다.

## 서비스 개요

Md2Rh는 Markdown 문서를 보고서 형태로 작성하고, 우측 A4 미리보기에서 결과를 확인하며, 최종 결과물을 내보내는 도구입니다.

- 좌측: 편집 영역(표지/본문)
- 우측: A4 실시간 미리보기
- 상단: 스타일 관리자, 테마, 다크모드, 도움말, GitHub 링크

## 기본 작업 순서

1. 표지 탭에서 제목/작성자/문서 개요를 입력합니다.
2. 본문 탭에서 Markdown 내용을 작성합니다.
3. 필요하면 스타일을 변경하거나 스타일 관리자로 상세 편집합니다.
4. 우측 미리보기에서 페이지 구성을 확인하고 하이라이트로 검토합니다.
5. PDF, DOCX, ZIP 중 필요한 형식으로 내보냅니다.

## 표지 탭 상세 가이드

표지 탭에서는 문서 첫 페이지 정보를 설정합니다.

- 문서 제목: 표지 중앙의 큰 제목으로 출력
- 작성자 정보: 여러 줄 입력 가능(작성자, 소속, 이메일 등)
- 문서 개요: Abstract처럼 짧은 소개 문구 입력

입력 예시:

\`\`\`
문서 제목: 2026년 1분기 서비스 운영 보고서

작성자 정보:
작성자: 홍길동
소속: 플랫폼운영팀
이메일: ops@example.com

문서 개요:
본 문서는 2026년 1분기 운영 지표, 장애 통계, 개선 과제를 정리한 보고서입니다.
\`\`\`

## 본문 탭 상세 가이드

본문 탭에서는 Markdown으로 실제 콘텐츠를 작성합니다.

- 툴바로 빠른 문법 삽입 가능(제목, 목록, 표, 코드, 링크, 이미지)
- 우측 미리보기에 즉시 반영
- Undo/Redo 이력 최대 50단계 유지

### 자주 쓰는 단축키

- 실행 취소: Ctrl(Cmd)+Z
- 다시 실행: Ctrl(Cmd)+Y 또는 Ctrl(Cmd)+Shift+Z
- 들여쓰기: Tab
- 내어쓰기: Shift+Tab

### 툴바 없이 직접 작성하는 기본 문법

\`\`\`markdown
# 제목 1
## 제목 2
### 제목 3

**굵게** / *기울임*

- 순서 없는 목록
1. 순서 있는 목록

> 인용문
\`\`\`

코드 블록 예시:
\`\`\`
~~~ts
const status = "ok"
console.log(status)
~~~
\`\`\`

## 이미지 삽입 상세 가이드

이미지는 4가지 방식으로 넣을 수 있습니다.

### 로컬 파일 드래그 앤 드롭

- 이미지 파일을 편집창 위로 드래그해서 놓으면
- 현재 커서 위치에 Markdown 이미지 문법이 자동 삽입됩니다.

자동 삽입 예시:
\`\`\`markdown
![diagram.png](blob:...)
\`\`\`

### 클립보드 복사 후 붙여넣기

- 캡처 도구나 이미지 뷰어에서 복사(Ctrl/Cmd+C)
- 본문 에디터에서 붙여넣기(Ctrl/Cmd+V)
- 커서 위치에 이미지가 자동 삽입됩니다.

### 외부 이미지 URL 직접 입력

아래처럼 Markdown 이미지 문법으로 직접 넣을 수 있습니다.

\`\`\`markdown
![시스템 구성도](https://example.com/assets/architecture.png)
\`\`\`

### 브라우저에서 이미지 URL/이미지 요소 드롭

- 브라우저 탭의 이미지나 이미지 URL을 에디터로 드롭하면
- URL 또는 변환된 blob 주소로 자동 삽입됩니다.

실무 팁:
- 최종 공유용 문서는 외부 URL이 끊길 수 있으므로 가능하면 로컬 이미지/붙여넣기 기반으로 작업 후 ZIP 보관을 권장합니다.

## 표 작성 및 열(셀) 크기 조정 가이드

기본 표 문법:

\`\`\`markdown
| 항목 | 내용 |
| --- | --- |
| 상태 | 진행중 |
| 담당 | 플랫폼팀 |
\`\`\`

### 열 너비 지정 방법(중요)

이 서비스는 **헤더 셀 텍스트에 너비 토큰을 넣는 방식**으로 열 너비를 조정합니다.

- 형식: \`{{숫자%}}\`
- 위치: 헤더 셀 안 텍스트에 포함
- 예시:

\`\`\`markdown
| 항목 {{25%}} | 상세 내용 {{75%}} |
| --- | --- |
| 배포 상태 | 정상 |
| 이슈 | 없음 |
\`\`\`

동작 방식:
- 헤더의 \`{{25%}}\`, \`{{75%}}\`가 각 열 폭으로 적용됩니다.
- 본문 셀(td)에도 같은 열 폭이 자동 적용됩니다.
- 퍼센트가 없거나 잘못된 값이면 자동 너비로 렌더링됩니다.

주의:
- 열 폭은 **열 단위**로 적용됩니다. 개별 행의 특정 셀만 따로 너비를 바꾸는 방식은 지원하지 않습니다.
- 일반적으로 전체 열 비율 합을 100% 안팎으로 맞추는 것을 권장합니다.

## 링크 카드 기능

다음 형태는 일반 텍스트 링크가 아니라 카드 형태로 렌더링됩니다.

1. 한 줄에 URL만 작성
2. 한 줄에 \`[텍스트](URL)\`만 작성

예시:

\`\`\`markdown
https://example.com/docs/overview

[서비스 운영 가이드](https://example.com/runbook)
\`\`\`

## 스타일 기능 상세 가이드

### 스타일 선택

- 본문 상단 스타일 드롭다운에서 즉시 전환
- 전환 결과는 우측 미리보기에 즉시 반영

### 스타일 관리자에서 가능한 작업

- 새 스타일 생성
- 기존 스타일 선택
- 스타일 편집
- 스타일 복제
- JSON 다운로드(백업/공유)
- JSON 가져오기(드래그 앤 드롭)
- 스타일 삭제(최소 1개 유지)

### 스타일 편집 항목

- 제목(H1~H6): 폰트, 크기, 굵기, 색상, 여백, 번호 형식
- 텍스트: 본문/인용문/강조/기울임/링크
- UL 목록: 레벨별 마커, 간격, 들여쓰기, 폰트
- OL 목록: 레벨별 번호 형식, 간격, 들여쓰기, 폰트
- 표: table/th/td 스타일
- 코드: 인라인 코드/코드 블록 스타일

## 미리보기 및 검토 기능

- A4 페이지 기준으로 결과 확인
- 하이라이트 색상 선택 가능
- 하이라이트 모드 ON 후 텍스트를 드래그하면 강조 표시 삽입

검토 팁:
- 출력 전 페이지 나눔 위치를 꼭 확인하세요.
- 표가 길면 열 너비 토큰을 먼저 조정한 뒤 스타일을 미세 조정하세요.

## 내보내기 기능 차이

- PDF: 최종 배포/인쇄용
- DOCX: 워드 후편집용
- ZIP: Markdown 원문 + 이미지 리소스 보관/이관용

## 자동 저장 및 환경 설정

- 스타일 목록: 브라우저 localStorage에 자동 저장
- 앱 테마(색상): 자동 저장
- 라이트/다크/시스템 모드 전환 지원

## 문제 해결

### 이미지가 안 보일 때

- 외부 URL 이미지라면 접근 권한/차단(CORS) 여부를 확인하세요.
- 가능한 경우 로컬 파일 드롭 또는 클립보드 붙여넣기로 재삽입하세요.

### 표 너비가 기대와 다를 때

- 헤더 셀에 \`{{30%}}\` 형식이 정확한지 확인하세요.
- \`{{30}}\`, \`{30%}\` 같은 형식은 인식되지 않습니다.

### 번호가 중복될 때

- 제목 텍스트에 수동 번호(\`1.\`, \`2-1\` 등)를 넣지 마세요.
- 제목 번호는 스타일의 자동 넘버링 기능으로 관리하세요.
`)
  const [coverFooter, setCoverFooter] = useState(
    "이 문서는 Md2Rh 서비스에서 제공하는 핵심 기능과 활용 방법을 정리한 사용자 안내서입니다.\n문서 작성, 스타일 편집, 미리보기 검토, 내보내기(PDF/DOCX/ZIP)까지 전체 흐름을 빠르게 익힐 수 있습니다."
  )
  const [coverAuthor, setCoverAuthor] = useState(
    "작성자: Md2Rh 운영팀\n소속: Product & Documentation\n이메일: support@md2rh.local"
  )

  // Undo/Redo state management
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: markdown,
    future: []
  })

  // Update markdown with history tracking
  const updateMarkdown = useCallback((newValue: string, addToHistory: boolean = true) => {
    if (addToHistory) {
      setHistory(prev => ({
        past: [...prev.past, prev.present].slice(-50), // Keep last 50 states
        present: newValue,
        future: []
      }))
    }
    setMarkdown(newValue)
  }, [])

  // Undo function
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev
      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, -1)
      setMarkdown(previous)
      return {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future]
      }
    })
  }, [])

  // Redo function
  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev
      const next = prev.future[0]
      const newFuture = prev.future.slice(1)
      setMarkdown(next)
      return {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture
      }
    })
  }, [])

  // Sync markdown with history.present when history changes
  useEffect(() => {
    if (history.present !== markdown) {
      setMarkdown(history.present)
    }
  }, [history.present])

  // 전역 단축키 리스너 추가 (미리보기 포커스 시에도 실행 취소 지원)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement
      const isEditing = activeElement && (
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true"
      )
      
      // 입력창이나 에디터 포커스 상태일 때는 전역 핸들러에서 가로채지 않음
      if (isEditing) return
      
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        undo()
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        redo()
      }
    }
    
    window.addEventListener("keydown", handleGlobalKeyDown)
    return () => window.removeEventListener("keydown", handleGlobalKeyDown)
  }, [undo, redo])

  const [styles, setStyles] = useState<DocumentStyle[]>([])
  const [selectedStyleId, setSelectedStyleId] = useState<string>("")
  const [isStyleManagerOpen, setIsStyleManagerOpen] = useState(false)
  const [tempStyle, setTempStyle] = useState<DocumentStyle | null>(null) // 실시간 편집을 위한 임시 스타일
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

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
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 shrink-0 z-50">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="MD2PDF" 
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant={isStyleManagerOpen ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsStyleManagerOpen(!isStyleManagerOpen)}
            className="gap-2 h-8 text-xs"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            스타일 관리자
          </Button>

          <div className="w-px h-4 bg-border mx-2" />

          <ThemeSelector />

          <ModeToggle />

          <Button variant="ghost" size="icon" onClick={() => setIsHelpModalOpen(true)} className="h-8 w-8">
            <HelpCircle className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <a href="https://github.com/superwhyun/Md2Rh" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 h-full relative">
          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            {isStyleManagerOpen && (
              <>
                <ResizablePanel
                  id="sidebar"
                  order={1}
                  defaultSize={22}
                  minSize={18}
                  maxSize={35}
                  className="bg-background"
                >
                  <div className="h-full flex flex-col border-r">
                    <div className="h-10 px-3 border-b flex items-center justify-between bg-muted/30">
                      <span className="text-xs font-medium text-muted-foreground">스타일 관리자</span>
                      <Button variant="ghost" size="icon" onClick={() => {
                        setIsStyleManagerOpen(false)
                        setTempStyle(null)
                      }} className="h-6 w-6">
                        <span className="text-xs">✕</span>
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto p-3">
                      <StyleManager
                        isOpen={true}
                        onClose={() => {
                          setIsStyleManagerOpen(false)
                          setTempStyle(null)
                        }}
                        styles={styles}
                        onStylesUpdate={handleStylesUpdate}
                        selectedStyleId={selectedStyleId}
                        onStyleSelect={handleStyleSelect}
                        isSidebar={true}
                        onTempStyleUpdate={setTempStyle}
                      />
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
              </>
            )}

            <ResizablePanel id="editor" order={2} defaultSize={isStyleManagerOpen ? 37 : 50} minSize={25}>
              <div className="h-full flex flex-col bg-background">
                <MarkdownEditor
                  value={markdown}
                  onChange={updateMarkdown}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={history.past.length > 0}
                  canRedo={history.future.length > 0}
                  title={title}
                  onTitleChange={setTitle}
                  coverAuthor={coverAuthor}
                  onCoverAuthorChange={setCoverAuthor}
                  coverFooter={coverFooter}
                  onCoverFooterChange={setCoverFooter}
                  styles={styles}
                  selectedStyleId={selectedStyleId}
                  onStyleSelect={handleStyleSelect}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Fixed Preview Section - Width fixed to ~700px to fit scaled A4 */}
        <div className="flex-none w-[700px] border-l-2 border-l-border bg-slate-200 dark:bg-slate-900 flex flex-col h-full overflow-hidden shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.05)]">
          <div className="flex-1 overflow-hidden relative">
            <MarkdownPreview
              markdown={markdown}
              onMarkdownChange={updateMarkdown}
              style={selectedStyle}
              title={title}
              coverAuthor={coverAuthor}
              coverFooter={coverFooter}
            />
          </div>
        </div>
      </div>

      {/* 사용법 모달 */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
