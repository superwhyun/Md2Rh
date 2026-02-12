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
            boxSizing: 'border-box'
          } : {
            width: '210mm',
            height: '297mm',
            padding: '0',
            boxSizing: 'border-box',
            transform: 'scale(0.75)',
            transformOrigin: 'top left', // Changed to top left to fit in wrapper
            position: 'absolute', // Absolute to sit inside relative wrapper
            top: 0, left: 0
          }}>
            <div style={{
              ...style?.styles.body,
              padding: '10mm',
              margin: '10mm',
              height: 'calc(297mm - 20mm)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              paddingTop: '15%'
            }}>
              <h1 style={{
                ...style?.styles.h1,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                fontFamily: 'Pretendard, sans-serif',
                backgroundColor: 'transparent',
                marginBottom: '0',
                lineHeight: '1.1',
                flex: 'none',
                color: '#000000'
              }}>
                {title}
              </h1>
              <div style={{ flex: '1', display: 'flex', alignItems: 'center' }}>
                <p style={{
                  ...style?.styles.p,
                  fontSize: '1.5rem',
                  color: '#666',
                  margin: '0'
                }}>
                  {today}
                </p>
              </div>
              {coverFooter && (
                <div style={{ flex: 'none', width: '100%', marginTop: 'auto', textAlign: 'left', paddingTop: '40px' }}>
                  <div style={{ ...style?.styles.p, fontSize: '1rem', color: '#444' }}>
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
            </div>
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
    <div className="h-full flex flex-col">
      <div className="bg-background border-b z-10 shrink-0">
        <div className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block ml-1">
              Live Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm bg-secondary/50 px-2 py-1 rounded text-secondary-foreground">
                {style?.name || '기본 서식'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-md mr-2">
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => setHighlightColor(e.target.value)}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer overflow-hidden"
                title="하이라이트 색상"
              />
              <Button
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                variant={isHighlightMode ? "secondary" : "ghost"}
                size="sm"
                className={`h-8 w-8 p-0 ${isHighlightMode ? "bg-accent text-accent-foreground ring-2 ring-primary" : "hover:bg-secondary/50"}`}
                title={isHighlightMode ? "하이라이트 모드 끄기" : "하이라이트 모드 켜기 (선택 시 자동 적용)"}
              >
                <Highlighter className="h-4 w-4" style={{ color: highlightColor }} />
              </Button>
            </div>

            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              variant="default"
              size="sm"
              className="gap-2 shadow-sm"
            >
              {isPrinting ? (
                <>PDF 생성 중...</>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  <span>PDF 저장</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto bg-gray-100 dark:bg-muted/10 w-full"
        style={{ padding: '20px 0' }}
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
