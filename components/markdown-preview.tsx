"use client"

import { useRef, useState } from "react"
import type { DocumentStyle } from "@/lib/default-styles"
import { addNumberingToMarkdown } from "@/lib/numbering"
import { detectStandaloneLinks } from "@/lib/markdown-processor"
import { parseListDepth } from "@/lib/list-depth-parser"
import { PaginatedPreview } from "@/components/paginated-preview"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Printer, Highlighter } from "lucide-react"
import { Button } from "@/components/ui/button"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface MarkdownPreviewProps {
  markdown: string
  style?: DocumentStyle
  title?: string
  coverFooter?: string
  onMarkdownChange?: (markdown: string) => void
}

export function MarkdownPreview({ markdown, style, title, coverFooter, onMarkdownChange }: MarkdownPreviewProps) {
  const [highlightColor, setHighlightColor] = useState("#ffff00")
  const [isHighlightMode, setIsHighlightMode] = useState(false)

  const handleHighlight = () => {
    if (!onMarkdownChange) return
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const text = selection.toString()
    if (!text.trim()) return

    // 보색 계산
    const hex = highlightColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    const compR = 255 - r
    const compG = 255 - g
    const compB = 255 - b

    const textColor = `rgb(${compR}, ${compG}, ${compB})`
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
    const span = `<span data-highlight="true" style="background-color: ${highlightColor}; color: ${textColor}; display: inline; box-decoration-break: clone; -webkit-box-decoration-break: clone;">${escapedText}</span>`

    // 선택한 텍스트가 마크다운에 존재하는지 확인
    if (!markdown.includes(text)) {
      alert("원본 텍스트를 찾을 수 없습니다. (서식이 포함된 텍스트는 하이라이트할 수 없습니다)")
      return
    }

    // 텍스트가 여러 번 나타나는지 확인
    const occurrences = markdown.split(text).length - 1

    if (occurrences === 1) {
      // 한 번만 나타나면 바로 교체
      onMarkdownChange(markdown.replace(text, span))
      selection.removeAllRanges()
    } else {
      // 여러 번 나타나면 문맥 기반으로 찾기 시도
      const range = selection.getRangeAt(0)
      const startContainer = range.startContainer
      const endContainer = range.endContainer

      // 시작과 끝이 같은 텍스트 노드인 경우만 문맥 검색
      if (startContainer === endContainer && startContainer.nodeType === 3) {
        const fullText = startContainer.textContent || ""
        const beforeText = fullText.substring(Math.max(0, range.startOffset - 20), range.startOffset)
        const afterText = fullText.substring(range.endOffset, Math.min(fullText.length, range.endOffset + 20))

        const searchPattern = beforeText + text + afterText

        if (markdown.includes(searchPattern)) {
          const replacement = beforeText + span + afterText
          onMarkdownChange(markdown.replace(searchPattern, replacement))
          selection.removeAllRanges()
          return
        }
      }

      // 문맥 검색 실패 시 첫 번째 occurrence 교체
      onMarkdownChange(markdown.replace(text, span))
      selection.removeAllRanges()
    }
  }

  const handleMouseUp = () => {
    if (isHighlightMode) {
      // 텍스트 선택이 완료된 시점에 약간의 딜레이를 주어 selection이 정확히 잡히도록 함
      setTimeout(handleHighlight, 10)
    }
  }

  const renderTitlePage = () => {
    if (!title?.trim()) return null

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isPrinting ? '0' : '20px' }}>
        <div style={isPrinting ? { width: '210mm', height: '297mm' } : { width: '157.5mm', height: '222.75mm', position: 'relative' }}>
          <div data-cover-page="true" className={isPrinting ? "bg-white" : "bg-white shadow-lg"} style={isPrinting ? {
            width: '210mm',
            height: '297mm',
            padding: '0',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          } : {
            width: '210mm',
            height: '297mm',
            padding: '0',
            boxSizing: 'border-box',
            transform: 'scale(0.75)',
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0, left: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* 상단 장식 바 */}
            <div style={{
              width: '100%',
              height: '30px',
              minHeight: '30px',
              background: 'linear-gradient(90deg, #2c3e50 0%, #3498db 50%, #2c3e50 100%)',
              flexShrink: 0
            }} />

            {/* 메인 컨텐츠 래퍼 - flex:1로 남은 공간 차지 */}
            <div style={{
              ...style?.styles.body,
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '40px 60px',
              boxSizing: 'border-box'
            }}>
              {/* 상단 장식 라인 */}
              <div style={{
                width: '150px',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #3498db, transparent)',
                margin: '0 auto 60px auto',
                flexShrink: 0
              }} />

              {/* 상단 여백 */}
              <div style={{ flex: '0 0 80px' }} />

              {/* 메인 컨텐츠 영역 */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'center',
                textAlign: 'center'
              }}>
                {/* 제목 상단 장식 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '25px'
                }}>
                  <div style={{ width: '40px', height: '1px', background: '#bdc3c7' }} />
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#3498db',
                    borderRadius: '2px'
                  }} />
                  <div style={{ width: '40px', height: '1px', background: '#bdc3c7' }} />
                </div>

                {/* 제목 */}
                <h1 style={{
                  ...style?.styles.h1,
                  fontSize: '2.8rem',
                  fontWeight: '700',
                  fontFamily: 'Pretendard, sans-serif',
                  backgroundColor: 'transparent',
                  marginBottom: '25px',
                  lineHeight: '1.3',
                  color: '#2c3e50',
                  letterSpacing: '-0.02em',
                  maxWidth: '85%',
                  margin: '0 auto 25px auto'
                }}>
                  {title}
                </h1>

                {/* 제목 하단 장식 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginBottom: '50px'
                }}>
                  <div style={{ width: '40px', height: '1px', background: '#bdc3c7' }} />
                  <div style={{
                    width: '10px',
                    height: '10px',
                    background: '#3498db',
                    borderRadius: '2px'
                  }} />
                  <div style={{ width: '40px', height: '1px', background: '#bdc3c7' }} />
                </div>

                {/* 날짜 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px 30px',
                  background: '#f8f9fa',
                  borderRadius: '30px',
                  border: '1px solid #e9ecef'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7f8c8d" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <p style={{
                    ...style?.styles.p,
                    fontSize: '1.1rem',
                    color: '#7f8c8d',
                    margin: '0',
                    fontWeight: '500'
                  }}>
                    {today}
                  </p>
                </div>
              </div>

              {/* 하단 푸터 영역 */}
              {coverFooter && (
                <div style={{
                  width: '100%',
                  paddingTop: '30px',
                  borderTop: '1px solid #e9ecef',
                  flexShrink: 0
                }}>
                  <div style={{
                    ...style?.styles.p,
                    fontSize: '0.95rem',
                    color: '#555',
                    textAlign: 'left'
                  }}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p style={{ marginBottom: '0.5em', ...style?.styles.p }} {...props} />,
                        strong: ({ node, ...props }) => <strong style={{ fontWeight: 'bold' }} {...props} />,
                        em: ({ node, ...props }) => <em style={{ fontStyle: 'italic' }} {...props} />,
                        ul: ({ node, ...props }) => <ul style={{ listStyleType: 'disc', paddingLeft: '1.5em', marginBottom: '0.5em' }} {...props} />,
                        ol: ({ node, ...props }) => <ol style={{ listStyleType: 'decimal', paddingLeft: '1.5em', marginBottom: '0.5em' }} {...props} />,
                        li: ({ node, ...props }) => <li style={{ marginBottom: '0.2em' }} {...props} />,
                        table: ({ node, ...props }) => <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1em', fontSize: '0.9em', ...style?.styles.table }} {...props} />,
                        thead: ({ node, ...props }) => <thead style={{ backgroundColor: '#f8f9fa' }} {...props} />,
                        tbody: ({ node, ...props }) => <tbody {...props} />,
                        tr: ({ node, ...props }) => <tr style={{ borderBottom: '1px solid #ddd' }} {...props} />,
                        th: ({ node, ...props }) => <th style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', textAlign: 'left', ...style?.styles.th }} {...props} />,
                        td: ({ node, ...props }) => <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', ...style?.styles.td }} {...props} />
                      }}
                    >
                      {coverFooter}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {/* 하단 장식 - absolute 대신 margin으로 처리 */}
              {!coverFooter && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: 'auto',
                  paddingBottom: '20px'
                }}>
                  <div style={{ width: '30px', height: '1px', background: '#bdc3c7' }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#3498db'
                  }} />
                  <div style={{ width: '30px', height: '1px', background: '#bdc3c7' }} />
                </div>
              )}
            </div>

            {/* 하단 장식 바 - absolute 제거, flexbox 사용 */}
            <div style={{
              width: '100%',
              height: '15px',
              minHeight: '15px',
              background: 'linear-gradient(90deg, #2c3e50 0%, #3498db 50%, #2c3e50 100%)',
              flexShrink: 0
            }} />
          </div>
        </div>
      </div>
    )
  }
  const printRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  type DisabledStyleNode = {
    node: HTMLStyleElement | HTMLLinkElement
    previousMedia: string | null
  }

  // 스타일시트 비활성화 및 oklch가 없는 새 스타일 생성
  const disableOklchStyles = (): { disabledSheets: DisabledStyleNode[], newStyle: HTMLStyleElement } => {
    const disabledSheets: DisabledStyleNode[] = []
    const styleSheets = Array.from(document.styleSheets)

    styleSheets.forEach((sheet) => {
      const ownerNode = sheet.ownerNode
      if (!(ownerNode instanceof HTMLStyleElement || ownerNode instanceof HTMLLinkElement)) {
        return
      }

      let hasOklch = false
      try {
        hasOklch = Array.from(sheet.cssRules).some((rule) => rule.cssText.toLowerCase().includes("oklch("))
      } catch {
        // cross-origin stylesheet 접근 에러는 무시
      }

      if (!hasOklch) return

      disabledSheets.push({
        node: ownerNode,
        previousMedia: ownerNode.getAttribute("media"),
      })
      ownerNode.setAttribute("data-disabled-oklch", "true")
      ownerNode.setAttribute("media", "not all")
    })

    // oklch 없는 기본 스타일 추가
    const newStyle = document.createElement('style')
    newStyle.textContent = `
      :root {
        --background: #f9f9fb !important;
        --foreground: #211f26 !important;
        --card: #ffffff !important;
        --card-foreground: #211f26 !important;
        --primary: #7f5a8f !important;
        --primary-foreground: #f9f9fb !important;
        --secondary: #e1d9e8 !important;
        --secondary-foreground: #211f26 !important;
        --muted: #e0dee5 !important;
        --muted-foreground: #6d6478 !important;
        --accent: #e8b2b6 !important;
        --accent-foreground: #5a3d3e !important;
        --border: #d3cfd8 !important;
        --input: #ece9f0 !important;
      }
      .bg-white { background-color: #ffffff !important; }
      .bg-background { background-color: #ffffff !important; }
      body { color: #000000 !important; }
      .text-foreground { color: #000000 !important; }
      .border { border-color: #e5e7eb !important; }
      [data-pdf-capture-root="true"] p,
      [data-pdf-capture-root="true"] li,
      [data-pdf-capture-root="true"] td,
      [data-pdf-capture-root="true"] th {
        color: #222222;
        -webkit-text-fill-color: #222222;
      }
      [data-pdf-capture-root="true"] [data-pdf-text="true"] {
        color: #222222;
        -webkit-text-fill-color: #222222;
      }
      [data-pdf-capture-root="true"] [data-highlight="true"] {
        display: inline;
        -webkit-text-fill-color: currentColor;
      }
    `
    document.head.appendChild(newStyle)

    return { disabledSheets, newStyle }
  }

  // 스타일 복원
  const restoreOklchStyles = (disabledSheets: DisabledStyleNode[], newStyle: HTMLStyleElement) => {
    disabledSheets.forEach(({ node, previousMedia }) => {
      node.removeAttribute("data-disabled-oklch")
      if (previousMedia === null) {
        node.removeAttribute("media")
      } else {
        node.setAttribute("media", previousMedia)
      }
    })
    newStyle.remove()
  }

  const normalizeHighlightTextForCanvas = (doc: Document) => {
    const highlightNodes = Array.from(doc.querySelectorAll('[data-highlight="true"]'))
    const parentNodes = highlightNodes
      .map((node) => node.parentElement)
      .filter((parent): parent is HTMLElement => Boolean(parent))
    const processedParents = new Set<HTMLElement>()

    highlightNodes.forEach((node) => {
      const text = node.textContent || ""
      const styleAttr = node.getAttribute("style") || ""
      const fragment = doc.createDocumentFragment()

      for (const char of Array.from(text)) {
        const charSpan = doc.createElement("span")
        charSpan.setAttribute("data-highlight-fragment", "true")
        charSpan.setAttribute(
          "style",
          `${styleAttr}; white-space: pre; font-family: inherit; font-size: inherit; font-weight: inherit; font-style: inherit; line-height: inherit; letter-spacing: inherit; text-rendering: inherit;`
        )
        charSpan.textContent = char
        fragment.appendChild(charSpan)
      }

      node.replaceWith(fragment)
    })

    parentNodes.forEach((parent) => {
      if (!parent || processedParents.has(parent)) return
      processedParents.add(parent)

      Array.from(parent.childNodes).forEach((child) => {
        if (child.nodeType !== Node.TEXT_NODE) return
        if (!child.textContent) return

        const textSpan = doc.createElement("span")
        textSpan.setAttribute("data-pdf-text", "true")
        textSpan.setAttribute(
          "style",
          "font-family: inherit; font-size: inherit; font-weight: inherit; font-style: inherit; line-height: inherit; letter-spacing: inherit;"
        )
        textSpan.textContent = child.textContent
        parent.replaceChild(textSpan, child)
      })
    })
  }

  const findSafePageBreakY = (
    canvas: HTMLCanvasElement,
    startY: number,
    targetEndY: number,
    minEndY: number
  ) => {
    const ctx = canvas.getContext("2d")
    if (!ctx) return targetEndY

    const searchPadding = 120
    const lower = Math.max(minEndY, targetEndY - searchPadding)
    const upper = Math.min(canvas.height - 1, targetEndY + searchPadding)
    if (upper <= lower) return targetEndY

    const yStart = Math.floor(lower)
    const yEnd = Math.floor(upper)
    const h = yEnd - yStart + 1

    let imageData: ImageData
    try {
      imageData = ctx.getImageData(0, yStart, canvas.width, h)
    } catch {
      return targetEndY
    }

    const { data, width, height } = imageData
    let bestY = targetEndY
    let bestDistance = Number.POSITIVE_INFINITY
    let foundBlankRow = false

    for (let row = 0; row < height; row++) {
      let hasInk = false
      for (let x = 0; x < width; x += 3) {
        const idx = (row * width + x) * 4
        const alpha = data[idx + 3]
        if (alpha < 8) continue

        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        if (r < 245 || g < 245 || b < 245) {
          hasInk = true
          break
        }
      }

      if (!hasInk) {
        foundBlankRow = true
        const y = yStart + row
        const distance = Math.abs(y - targetEndY)
        if (distance < bestDistance) {
          bestDistance = distance
          bestY = y
        }
      }
    }

    if (!foundBlankRow) return targetEndY
    if (bestY <= startY) return targetEndY
    return bestY
  }

  const handlePrint = async () => {
    if (printRef.current && !isPrinting) {
      setIsPrinting(true)

      // oklch 스타일 비활성화
      const { disabledSheets, newStyle } = disableOklchStyles()

      // 상태 업데이트 반영을 위해 약간의 딜레이
      await new Promise(resolve => setTimeout(resolve, 100))

      try {
        printRef.current.setAttribute("data-pdf-capture-root", "true")

        // A4 사이즈 설정 (mm)
        const a4Width = 210
        const a4Height = 297

        // 페이지 여백 설정 (mm)
        const marginTop = 15
        const marginBottom = 15
        const marginLeft = 10
        const contentWidth = a4Width - marginLeft * 2  // 실제 콘텐츠 너비
        const contentHeight = a4Height - marginTop - marginBottom  // 실제 콘텐츠 높이

        // PDF 생성
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        })

        // Noto Sans KR 폰트 로드 (한글 지원)
        try {
          const fontUrl = 'https://fonts.gstatic.com/s/notosanskr/v36/PbyxFmXiEBPT4ITbgNA5Cgms3VYcOA-vvnIzzuozeLTq8H4hfeE.ttf'
          const fontResponse = await fetch(fontUrl)
          const fontBuffer = await fontResponse.arrayBuffer()
          const fontBase64 = btoa(
            new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
          )
          pdf.addFileToVFS('NotoSansKR-Regular.ttf', fontBase64)
          pdf.addFont('NotoSansKR-Regular.ttf', 'NotoSansKR', 'normal')
        } catch (fontError) {
          console.warn('한글 폰트 로드 실패, 기본 폰트 사용:', fontError)
        }

        // 프린트 영역의 모든 페이지 요소 찾기 (bg-white 클래스를 가진 실제 페이지들)
        const pageElements = printRef.current.querySelectorAll('.bg-white')

        if (pageElements.length === 0) {
          throw new Error('페이지 요소를 찾을 수 없습니다.')
        }

        let isFirstPage = true
        let contentPageNumber = 0  // 본문 페이지 번호 (커버페이지 제외)

        for (let i = 0; i < pageElements.length; i++) {
          const element = pageElements[i] as HTMLElement
          const isCoverPage = element.hasAttribute('data-cover-page')

          // 원본 transform 저장 및 제거
          const originalTransform = element.style.transform
          const originalWidth = element.style.width
          const originalMinHeight = element.style.minHeight
          const originalHeight = element.style.height
          element.style.transform = 'none'
          element.style.width = '210mm'

          // html2canvas로 요소를 캔버스로 변환 (전체 높이 캡처)
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794, // 210mm at 96dpi
            windowWidth: 794,
            onclone: (clonedDoc) => {
              normalizeHighlightTextForCanvas(clonedDoc)
            }
          })

          // 스타일 복원
          element.style.transform = originalTransform
          element.style.width = originalWidth
          element.style.minHeight = originalMinHeight
          element.style.height = originalHeight

          // 커버페이지는 분할 없이 한 장으로 처리
          if (isCoverPage) {
            if (!isFirstPage) {
              pdf.addPage()
            }
            isFirstPage = false

            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            pdf.addImage(imgData, 'JPEG', 0, 0, a4Width, a4Height)
            continue
          }

          // 본문 콘텐츠: 실제 캔버스 비율 기준으로 페이지 분할
          // (96dpi 가정값을 쓰면 환경별로 비율 왜곡이 생길 수 있음)
          const pxPerMm = canvas.width / contentWidth
          const contentHeightPx = contentHeight * pxPerMm
          const totalHeight = canvas.height
          let sourceY = 0

          // 캔버스를 콘텐츠 높이로 나누되, 텍스트가 없는 빈 행에서 페이지 경계를 찾음
          while (sourceY < totalHeight - 1) {
            if (!isFirstPage) {
              pdf.addPage()
            }
            isFirstPage = false
            contentPageNumber++

            const desiredEndY = Math.min(sourceY + contentHeightPx, totalHeight)
            const minEndY = Math.min(
              totalHeight,
              Math.floor(sourceY + contentHeightPx * 0.7)
            )
            let safeEndY = desiredEndY

            if (desiredEndY < totalHeight) {
              safeEndY = findSafePageBreakY(canvas, sourceY, desiredEndY, minEndY)
            }
            if (safeEndY <= sourceY) {
              safeEndY = desiredEndY
            }

            const sourceHeight = safeEndY - sourceY

            // 임시 캔버스 생성하여 해당 영역만 추출
            const pageCanvas = document.createElement('canvas')
            pageCanvas.width = canvas.width
            pageCanvas.height = Math.ceil(sourceHeight)
            const ctx = pageCanvas.getContext('2d')

            if (ctx) {
              // 흰색 배경으로 채우기
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)

              // 해당 페이지 영역 복사
              ctx.drawImage(
                canvas,
                0, sourceY,                    // source x, y
                canvas.width, sourceHeight,    // source width, height
                0, 0,                          // dest x, y
                canvas.width, sourceHeight     // dest width, height
              )

              // 캔버스를 이미지로 변환
              const imgData = pageCanvas.toDataURL('image/jpeg', 0.95)

              // PDF에 이미지 추가 (여백을 두고 배치)
              // 실제 콘텐츠 비율 계산
              const actualContentHeightMm = sourceHeight / pxPerMm
              pdf.addImage(imgData, 'JPEG', marginLeft, marginTop, contentWidth, actualContentHeightMm)

              // 모던 헤더 디자인 - 상단 악센트 라인
              pdf.setDrawColor(100, 100, 100)  // 진한 회색
              pdf.setLineWidth(0.5)
              pdf.line(marginLeft, 8, a4Width - marginLeft, 8)

              // 헤더 우측에 문서 제목 (있는 경우)
              if (title?.trim()) {
                pdf.setFont('NotoSansKR', 'normal')
                pdf.setFontSize(8)
                pdf.setTextColor(120, 120, 120)
                pdf.text(title.trim(), a4Width - marginLeft, 6, { align: 'right' })
              }

              // 모던 푸터 디자인 - 하단 악센트 라인
              pdf.setDrawColor(100, 100, 100)
              pdf.setLineWidth(0.5)
              pdf.line(marginLeft, a4Height - 8, a4Width - marginLeft, a4Height - 8)

              // 페이지 번호 (중앙 하단)
              pdf.setFont('NotoSansKR', 'normal')
              pdf.setFontSize(9)
              pdf.setTextColor(80, 80, 80)
              pdf.text(`${contentPageNumber}`, a4Width / 2, a4Height - 5, { align: 'center' })
            }

            sourceY = safeEndY
          }
        }

        // PDF 다운로드
        const fileName = title?.trim() ? `${title.trim()}.pdf` : '문서.pdf'
        pdf.save(fileName)

      } catch (error) {
        console.error('PDF 생성 오류:', error)
        alert('PDF 생성 중 오류가 발생했습니다.')
      } finally {
        printRef.current.removeAttribute("data-pdf-capture-root")
        // oklch 스타일 복원
        restoreOklchStyles(disabledSheets, newStyle)
        setIsPrinting(false)
      }
    }
  }

  if (!style) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">스타일을 선택해주세요</p>
      </div>
    )
  }

  // 독립적인 링크 감지 및 처리
  const { text: linkProcessedMarkdown } = detectStandaloneLinks(markdown)

  const numberedMarkdown = addNumberingToMarkdown(
    linkProcessedMarkdown,
    style.headingNumbering?.h1 || 'number',
    style.headingNumbering?.h2 || 'korean',
    style.headingNumbering?.h3 || 'parenthesis',
    style.headingNumbering?.h4 || 'none',
    style.headingNumbering?.h5 || 'none'
  )

  const finalMarkdown = parseListDepth(numberedMarkdown)

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Preview Header */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">{style?.name || '기본 서식'}</span>
          <span className="text-xs text-muted-foreground">미리보기</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Highlight Controls */}
          <div className="flex items-center gap-1.5 bg-muted/50 rounded-lg p-1">
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              className="w-5 h-5 p-0 border-0 rounded cursor-pointer overflow-hidden"
              title="하이라이트 색상"
            />
            <Button
              onClick={() => setIsHighlightMode(!isHighlightMode)}
              variant={isHighlightMode ? "secondary" : "ghost"}
              size="sm"
              className={`h-6 w-6 p-0 ${isHighlightMode ? "ring-1 ring-primary" : ""}`}
              title={isHighlightMode ? "하이라이트 모드 끄기" : "하이라이트 모드 켜기"}
            >
              <Highlighter className="h-3 w-3" style={{ color: highlightColor }} />
            </Button>
          </div>

          <div className="w-px h-4 bg-border mx-1" />

          {/* PDF Button */}
          <Button
            onClick={handlePrint}
            disabled={isPrinting}
            size="sm"
            className="gap-1.5 h-8 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            {isPrinting ? "생성 중..." : "PDF 저장"}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div
        className="flex-1 overflow-auto w-full py-6"
        onMouseUp={handleMouseUp}
      >
        <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {renderTitlePage()}
          <PaginatedPreview content={finalMarkdown} style={style} isPrinting={isPrinting} />
        </div>
      </div>
    </div>
  )
}
