"use client"

import { useState, useEffect } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { StyleManager } from "@/components/style-manager"
import { StyleSelector } from "@/components/style-selector"
import { HelpModal } from "@/components/help-modal"
import { Button } from "@/components/ui/button"
import { Github, Settings, HelpCircle, FileText, LayoutTemplate, Printer, Download } from "lucide-react"
import { type DocumentStyle, getDefaultStyles } from "@/lib/default-styles"
import { ModeToggle } from "@/components/mode-toggle"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export default function Home() {
  const [title, setTitle] = useState("")
  const [markdown, setMarkdown] = useState(`| 문서번호 | YT-COG-BIAS-REP-2025-08-22 | 작성자 | U2 PIA |
| --- | --- | --- | --- |
| 버전 | 1.0 | 작성일 | 2025-08-22 |

### Abstract

- 유튜브 알고리즘이 확증편향을 강화하여 국가별 사회적 갈등과 정치적 양극화를 심화시키고 있다는 의혹 검토
- 알고리즘 설계의 불투명성과 추천 모델의 구조적 문제로 인한 정보 거품(Filter Bubble) 현상 분석
- 주요 국가별 사례 연구(미국, 인도, 독일, 한국)를 통한 의도적 갈등 조장 가능성 평가

### Summary

- 유튜브는 전 세계에서 가장 큰 동영상 플랫폼으로, 추천 알고리즘이 개인화된 콘텐츠 소비를 극대화한다는 명목하에 확증편향을 체계적으로 강화하고 있음. 특히 정치적·사회적 쟁점과 관련된 영상은 사용자의 기존 신념과 일치하는 방향으로 더 강력히 추천됨.
- 미국의 경우, 대선 기간 동안 극단적 정치 성향의 채널들이 알고리즘 추천을 통해 확산되었으며 이는 사회적 양극화 심화로 이어졌음. 인도에서는 종교적·민족적 갈등을 자극하는 영상들이 추천 구조를 통해 확산되어 지역 사회 충돌을 증폭시켰음. 독일과 한국에서는 난민·이민자 문제, 젠더 갈등 등 사회적 논란이 알고리즘을 통해 증폭되는 현상이 보고됨.
- 알고리즘의 설계 자체가 사용자의 시청 시간을 극대화하도록 맞춰져 있기 때문에, 자극적이고 갈등 유발적인 콘텐츠가 체계적으로 우대되는 구조가 존재. 이는 단순한 기술적 산물이 아니라 의도적 전략일 가능성이 제기됨.

### Technical Details

- 알고리즘 작동 방식  
    - 유튜브 추천 시스템은 시청 이력, 검색 기록, 유사 사용자 행동 데이터를 기반으로 강화 학습 모델을 적용.  
    - 모델은 사용자의 관심을 오래 붙잡을 수 있는 콘텐츠를 우선순위에 두며, 결과적으로 자극적이고 감정적 반응을 불러일으키는 영상이 상위에 노출됨.  

- 확증편향 강화 메커니즘  
    - 사용자의 정치적 성향, 종교적 신념, 사회적 태도에 맞는 콘텐츠가 반복적으로 추천되어 ‘정보 편향의 자기 강화 루프’가 형성됨.  
    - 이는 필터 버블(Filter Bubble)과 에코 챔버(Echo Chamber) 효과를 심화시킴.  

- 국가별 갈등 조장 의혹  
    - 미국: QAnon, 극우 채널 영상이 대규모 확산  
    - 인도: 종교 갈등 관련 혐오 콘텐츠가 지역 폭력 사태와 연결  
    - 독일: 난민 반대 콘텐츠 추천 증가 → 극우 세력 성장과 결합  
    - 한국: 젠더 갈등 및 정치 성향 양극화를 유발하는 영상이 상위 노출  

### Additional Information

- 연구 기관과 시민단체는 유튜브의 알고리즘이 단순한 정보 전달을 넘어 사회 갈등을 증폭시키는 ‘디지털 갈등 증폭기’ 역할을 한다고 비판함.  
- 유럽연합(EU)과 미국은 플랫폼의 알고리즘 투명성 의무화를 검토 중이며, 인도와 한국에서는 규제 강화 요구가 증가하고 있음.  
- 그러나 유튜브는 알고리즘의 핵심 구조와 데이터셋을 영업 비밀로 간주하여 공개하지 않고 있으며, 이는 의도적 갈등 조장의 증거 검증을 어렵게 만드는 요인임.  

### Recommended Action Items

- 각국 정부와 국제기구 차원의 알고리즘 투명성 규제 강화 추진  
- 알고리즘 기반 추천 구조의 사회적 영향에 대한 장기적 연구 지원 확대  
- 시민사회와 학계 중심의 독립적 감시 체계 구축 필요  
- 플랫폼 기업의 사회적 책임 강화 및 고의적 갈등 조장 여부에 대한 국제 조사 필요  

### References

- EU Digital Services Act (DSA) 관련 문서  
- Amnesty International 보고서: “YouTube and the Cycle of Extremism”  
- MIT Technology Review: “The Algorithm that Radicalized the World”  
- Oxford Internet Institute 연구: “Echo Chambers and Political Polarization on YouTube”  
`)
  const [coverFooter, setCoverFooter] = useState("")

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
      {/* 상단 툴바 */}
      {/* 상단 툴바 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 flex items-center gap-4 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-2 mr-4">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg leading-none tracking-tight">Md2Rh Converter</h1>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Markdown to Report HTML</span>
          </div>
        </div>

        <div className="h-8 w-px bg-border/60 mx-2" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pl-1">Design System</span>
            <div className="flex items-center gap-2">
              <Button
                variant={isStyleManagerOpen ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setIsStyleManagerOpen(!isStyleManagerOpen)}
                className="flex items-center gap-2 h-9 border border-transparent hover:border-border/50 transition-all font-medium"
              >
                <LayoutTemplate className="h-4 w-4" />
                <span>서식 관리자</span>
              </Button>

              <StyleSelector styles={styles} selectedStyleId={selectedStyleId} onStyleSelect={handleStyleSelect} />
            </div>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <ModeToggle />

          <div className="w-px h-4 bg-border/60 mx-1" />

          <Button variant="ghost" size="icon" onClick={() => setIsHelpModalOpen(true)} className="text-muted-foreground hover:text-foreground">
            <HelpCircle className="h-5 w-5" />
            <span className="sr-only">사용법</span>
          </Button>

          <Button variant="ghost" size="icon" asChild className="text-muted-foreground hover:text-foreground">
            <a href="https://github.com/superwhyun/Md2Rh" target="_blank" rel="noopener noreferrer">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {isStyleManagerOpen && (
            <>
              <ResizablePanel
                id="sidebar"
                order={1}
                defaultSize={25}
                minSize={20}
                maxSize={40}
                className="bg-background"
              >
                <div className="h-full flex flex-col border-r">
                  <div className="p-4 border-b flex items-center justify-between bg-muted/30">
                    <h2 className="font-semibold">문서 서식 관리자</h2>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setIsStyleManagerOpen(false)
                    }}>
                      ✕
                    </Button>
                  </div>
                  <div className="flex-1 overflow-auto p-4">
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

          <ResizablePanel id="editor" order={2} defaultSize={isStyleManagerOpen ? 35 : 50} minSize={25}>
            <div className="h-full flex flex-col border-r bg-background">
              <MarkdownEditor
                value={markdown}
                onChange={setMarkdown}
                title={title}
                onTitleChange={setTitle}
                coverFooter={coverFooter}
                onCoverFooterChange={setCoverFooter}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel id="preview" order={3} defaultSize={isStyleManagerOpen ? 40 : 50} minSize={30}>
            <div className="h-full flex flex-col bg-muted/20 overflow-hidden">
              {/* Preview needs to handle its own scrolling */}
              <div className="flex-1 overflow-auto p-4 flex justify-center">
                <div className="origin-top scale-[0.8] sm:scale-[0.85] md:scale-[0.9] lg:scale-[1.0] transition-transform">
                  {/* Scale wrapper to fit A4 roughly or let user zoom? For now defaults are fine */}
                  <MarkdownPreview
                    markdown={markdown}
                    style={selectedStyle}
                    title={title}
                    coverFooter={coverFooter}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* 사용법 모달 */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
