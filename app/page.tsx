"use client"

import { useState, useEffect } from "react"
import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { StyleManager } from "@/components/style-manager"
import { StyleSelector } from "@/components/style-selector"
import { HelpModal } from "@/components/help-modal"
import { Button } from "@/components/ui/button"
import { Settings, Github, HelpCircle } from "lucide-react"
import { type DocumentStyle, getDefaultStyles } from "@/lib/default-styles"

export default function Home() {
  const [title, setTitle] = useState("")
  const [markdown, setMarkdown] = useState(`| 문서번호 | MSF-3D-ASSET-WG-2025-07-09 | 작성자 | Amanda Morgan (Patrick Cozy 대리) |
| --- | --- | --- | --- |
| 버전 | 1.0 | 작성일 | 2025-07-09 |

### Abstract

- 메타버스 표준 포럼 3D 애셋 상호운용성 워킹그룹 54차 회의에서 SIGGRAPH 2025 워크샵 준비와 USD/glTF 기술 동향 논의 진행
- Cesium Developer Conference에서 논의된 USD와 glTF의 지리공간 응용 분야에서의 상호운용성 방안 검토 및 향후 발전 방향 모색
- Gaussian Splatting, glTF-GLX 연계, 3D Tiles 통합 등 차세대 3D 포맷 표준화 전략과 기술적 융합 가능성에 대한 심층 분석

### Summary

- 메타버스 표준 포럼 3D 애셋 상호운용성 워킹그룹의 54차 회의가 개최되어 SIGGRAPH 2025 컨퍼런스 준비 현황과 USD/glTF 상호운용성 관련 최신 기술 동향을 집중 논의하였다. Patrick Cozy의 부재로 Amanda Morgan이 회의를 주재하였으며, Nick Porcino의 vertex attributes 작업 진행 상황과 향후 SIGGRAPH에서 발표할 내용들을 점검하였다.
- SIGGRAPH 2025에서 진행될 두 개의 주요 세션인 'Gaussian Splatting Frontiers Workshop'과 'USD/glTF BOF(Birds of a Feather)' 세션의 구체적인 계획을 수립하였다. Gaussian Splatting Workshop은 기존 Town Hall 발표자들을 초대하여 업데이트를 제공하는 형태로 진행되며, BOF 세션은 Slido를 활용한 상호작용적 데이터 수집에 중점을 둔 1시간 세션으로 구성될 예정이다.
- Cesium Developer Conference에서 논의된 USD와 glTF의 지리공간 응용 분야 활용 방안에 대한 상세한 보고가 이루어졌다. 특히 USD를 3D Tiles의 페이로드로 활용하는 방안과 dynamic objects 처리를 위한 USD의 고유 기능 활용 가능성이 집중 검토되었으며, 이는 기존 지리공간 표준과 USD의 강점을 결합하는 새로운 접근 방식으로 평가되었다.
- glTF의 차세대 확장인 GLX(glTF eXternal references) 포맷 개발 현황과 3D Tiles와의 통합 방안이 상세히 논의되었다. GLX는 외부 참조 목록 기능을 넘어서 3D Tiles에서 개척한 공간 분할 및 LOD 관리 기능을 흡수하여 보다 광범위한 산업 요구사항을 충족할 수 있는 포맷으로 발전할 계획이며, 이를 통해 Ikea와 같은 비지리공간 분야에서도 활용 가능한 범용적 솔루션 제공을 목표로 하고 있다.
    
    <aside>
    - **IKEA가 3D Tiles를 비지리공간 응용 분야에서 활용**:
        - 원래 3D Tiles는 지리공간(geospatial) 데이터 시각화를 위해 개발된 기술이었는데, IKEA는 이를 가구 전자상거래에 적용하고 있음
        - **3D Tiles의 공간 분할 및 체적 기능 활용**: IKEA는 3D Tiles의 volumetric과 spatial subdivision 기능이 자신들의 요구사항에 완벽하게 맞는다는 것을 발견함
    </aside>
    

### Technical Details

- SIGGRAPH 2025 워크샵 기술 구성:
    - Gaussian Splatting Frontiers Workshop 발표자 구성
    기존 Town Hall 시리즈에서 발표한 연사들을 중심으로 다양성 있는 발표자 구성을 완료하였으며, Huawei에서 추가 발표자 참여 의사를 표명하여 더욱 포괄적인 업계 관점을 제공할 수 있게 되었다. 각 발표는 짧은 업데이트 형태로 진행되어 충분한 토론 시간을 확보하고, 상호운용성에 특화된 포럼 형태의 패널 토론으로 구성된다.
    - BOF 세션 Slido 활용 전략
    1시간의 제한된 시간 내에서 최대한의 상호작용을 확보하기 위해 Slido 플랫폼을 적극 활용한다. Pain Points 프로젝트를 중심으로 한 20분 세션과 PBR Material 상호운용성에 대한 Henrik의 발표, 그리고 Gaussian Splatting 관련 논의를 병행하여 진행하며, 실시간 피드백 수집을 통해 향후 우선순위를 설정한다.
    - AV 설비 및 회의실 운영 계획
    SIGGRAPH BOF 세션은 AV 설비가 제공되지 않는 회의실에서 진행되므로 별도의 설비 구축이 필요하다. Leonard를 중심으로 회의실 크기, 음향 시설 필요성, 설치 시간 등을 금요일 회의에서 최종 확정할 예정이며, 일반적으로 시각적 설비는 용이하나 음향 설비에서 어려움이 예상된다.
- USD/glTF 지리공간 응용 기술 세부사항:
    - USD의 3D Tiles 페이로드 활용 방안
    기존 USD에 지리공간 메타데이터를 직접 통합하는 대신, USD를 3D Tiles 명세 내에서 동적 객체 처리를 위한 페이로드로 활용하는 방안이 제시되었다. 이는 USD의 고유한 composition, editing, metadata 기능을 활용하면서도 기존 지리공간 표준의 안정성을 보장하는 절충적 접근법으로 평가된다.
    - 동적 객체와 정적 지형의 분리 처리
    런타임 시뮬레이션 시스템과의 연동이 필요한 동적 객체는 USD로 처리하고, 정적 지형은 기존 glTF 기반 처리를 유지하는 hybrid 접근 방식을 채택한다. 이를 통해 각 포맷의 강점을 최대한 활용하면서도 전체적인 시스템 일관성을 유지할 수 있다.
    - 계층 구조와 레이어 개념 통합
    USD의 강력한 레이어 개념을 활용하여 상위 레벨 파일을 USD로 구성하고, 서로 다른 정보 유형별로 별도의 3D Tiles 계층구조를 구성하는 방안이 논의되었다. 이는 복잡한 지리공간 데이터의 효율적 관리와 선택적 로딩을 가능하게 한다.
- GLX 포맷 및 3D Tiles 통합 기술:
    - GLX 외부 참조 확장 기능
    GLX는 단순한 glTF 외부 참조 목록을 넘어서 3D Tiles에서 개척한 공간 분할(spatial subdivision), LOD 관리, 옥트리/쿼드트리 구조, 가용성 맵 등의 고급 기능을 흡수하여 범용적 활용이 가능하도록 설계된다. 이를 통해 지리공간뿐만 아니라 e-commerce, 산업 디지털 트윈 등 다양한 분야에서 활용 가능한 표준을 제공한다.
    - 3D Tiles 2.0과의 호환성 보장
    기존 3D Tiles 1.1과의 하위 호환성을 보장하면서도 GLX와의 기능 통합을 통해 3D Tiles 2.0으로의 진화 경로를 제공한다. 지리공간 특화 기능은 3D Tiles에서 계속 개발하되, 범용적으로 필요한 기능은 GLX로 이관하여 중복 개발을 방지하고 생태계 전체의 효율성을 향상시킨다.
    - 상호운용성 및 확장성 설계
    3D Tiles의 bowwave 혁신 효과를 활용하여 지리공간 커뮤니티에서 개척한 기능을 GLX가 흡수하고, 동시에 GLX에서 개발된 상호작용성, 물리 엔진 연동 등의 기능을 3D Tiles가 활용할 수 있는 flywheel 효과를 구축한다.
- Gaussian Splatting 표준화 전략:
    - 기본 확장 사항 정의
    GPU 준비 배열에 포인트 속성을 저장하는 기본 확장을 정의하고, 연구 진행에 따라 추가적인 유연성을 제공할 수 있는 구조로 설계한다. 이는 급속히 발전하는 Gaussian Splatting 기술의 변화에 대응하면서도 표준화의 안정성을 보장하는 점진적 접근법이다.
    - 다중 디시리얼라이저 지원
    Niantic의 SPZ 포맷을 포함한 다양한 디시리얼라이저를 지원할 수 있는 유연한 구조를 채택하여, 향후 개발될 새로운 압축 알고리즘이나 렌더링 기법에도 대응 가능하도록 설계한다. 기본 레벨에서는 표준 glTF 확장으로, 상위 레벨에서는 벤더 특화 구현을 허용하는 계층적 접근법을 채택한다.

### Additional Information

- Cesium Developer Conference 주요 시사점: 지리공간 커뮤니티에서 Gaussian Splatting에 대한 높은 관심도가 확인되었으며, 특히 송전선, 현수교 등 세밀한 구조물 렌더링에서 기존 메시 방식으로는 불가능했던 문제들이 Gaussian Splatting으로 해결 가능함이 입증됨
- OGC 참여 확대 필요성: 3D Tiles와 GLX의 통합 논의 과정에서 Open Geospatial Consortium의 정기적 참여가 필요하다는 의견이 제기되어 향후 초청 계획 수립 예정

### Recommended Action Items

- Nick Porcino의 Pain Points 프로젝트 작업 세션 조직 및 SIGGRAPH 전 완료
SIGGRAPH BOF 세션의 핵심 콘텐츠가 될 Pain Points 프로젝트의 완성도를 높이기 위해 Nick과 Felix 간의 조율을 통한 1-2시간 집중 작업 세션을 조직해야 한다. 이는 SIGGRAPH에서 실질적인 진전 상황을 발표하고 커뮤니티 피드백을 효과적으로 수집하기 위해 필수적이며, 동시에 향후 우선순위 설정을 위한 기반 자료로 활용될 수 있다.
- OGC(Open Geospatial Consortium) 정기 참여 체계 구축
3D Tiles와 GLX의 통합 논의가 활발해짐에 따라 지리공간 표준화 기구인 OGC의 정기적 참여가 필수적이다. 단순한 일회성 초청을 넘어서 지속적인 협력 체계를 구축하여 지리공간과 일반 3D 그래픽스 커뮤니티 간의 가교 역할을 강화해야 하며, 이를 통해 표준화 과정에서 발생할 수 있는 충돌이나 중복을 사전에 방지할 수 있다.
- USD Gaussian Splatting 제안서들 간의 조율 및 통합 논의 추진
현재 USD 커뮤니티 내에서 서로 다른 Gaussian Splatting 제안이 동시에 진행되고 있는 상황에서, 이들 간의 효과적인 조율이 필요하다. Nick Porcino가 확인한 기존 PR과 새로 제시된 스키마 간의 차이점을 분석하고 공통 기반을 찾아 통합된 접근 방식을 도출해야 하며, 이는 glTF 측에서 진행 중인 Gaussian Splatting 표준화 작업과의 정렬을 위해서도 중요하다.

### References

- Cesium Developer Conference 2025 발표 자료 및 논의 내용
- GLX (glTF eXternal references) 사양 초안: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_scene_graph
- USD Proposals Repository - LOD 제안서: https://github.com/PixarAnimationStudios/USD-proposals
- USD GitHub Gaussian Splatting PR: [Nick Porcino 제공 링크]

---

`)

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
        
        <Button variant="ghost" size="sm" onClick={() => setIsHelpModalOpen(true)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-4 w-4" />
          사용법
        </Button>
        
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

      {/* 사용법 모달 */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
