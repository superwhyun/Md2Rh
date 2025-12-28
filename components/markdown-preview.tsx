"use client"

import { useRef, useState } from "react"
import type { DocumentStyle } from "@/lib/default-styles"
import { addNumberingToMarkdown } from "@/lib/numbering"
import { detectStandaloneLinks } from "@/lib/markdown-processor"
import { parseListDepth } from "@/lib/list-depth-parser"
import { PaginatedPreview } from "@/components/paginated-preview"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarkdownPreviewProps {
  markdown: string
  style?: DocumentStyle
  title?: string
  coverFooter?: string
}

export function MarkdownPreview({ markdown, style, title, coverFooter }: MarkdownPreviewProps) {
  const renderTitlePage = () => {
    if (!title?.trim()) return null

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div className="bg-white shadow-lg" style={{
          width: '210mm',
          height: '297mm',
          padding: '0',
          boxSizing: 'border-box',
          transform: 'scale(0.75)',
          transformOrigin: 'top center',
          position: 'relative'
        }}>
          <div style={{
            ...style?.styles.body,
            padding: '10mm',
            border: '1px dashed #ccc',
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
              marginBottom: '0',
              lineHeight: '1.1',
              flex: 'none'
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
    )
  }
  const printRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = async () => {
    if (printRef.current && !isPrinting) {
      setIsPrinting(true)
      // 전체 프린트 영역 추출 (타이틀 페이지 + 본문 모두 포함)
      const allContent = printRef.current

      // 현재 페이지의 모든 스타일 추출
      const styleElement = printRef.current.querySelector('style')
      let customCSS = styleElement ? styleElement.textContent : ''

      // 타이틀 유무 확인
      const hasTitle = !!title?.trim()

      // 페이지의 모든 CSS 스타일시트 추출
      const allStylesheets = Array.from(document.styleSheets)
      let additionalCSS = ''

      try {
        allStylesheets.forEach(stylesheet => {
          try {
            if (stylesheet.cssRules) {
              const rules = Array.from(stylesheet.cssRules)
              additionalCSS += rules.map(rule => rule.cssText).join('\n')
            }
          } catch (e) {
            // CORS 제한으로 인한 에러 무시
            console.warn('Cannot access stylesheet:', e)
          }
        })
      } catch (e) {
        console.warn('Error extracting stylesheets:', e)
      }

      // Blob URL만 Base64로 변환하는 함수 (외부 URL은 그대로 유지)
      const convertBlobImagesToBase64 = async (htmlContent: string): Promise<string> => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        const images = tempDiv.querySelectorAll('img')

        const promises = Array.from(images).map(async (img) => {
          try {
            if (img.src && img.src.startsWith('blob:')) {
              // Blob URL만 Base64로 변환 (로컬 파일이므로 빠름)
              try {
                const response = await fetch(img.src)
                const blob = await response.blob()
                const dataURL = await new Promise<string>((resolve) => {
                  const reader = new FileReader()
                  reader.onload = () => resolve(reader.result as string)
                  reader.readAsDataURL(blob)
                })
                img.src = dataURL
                console.log('Blob URL converted to Base64 for print')
              } catch (blobError) {
                console.warn('Blob URL conversion failed:', blobError)
              }
            } else if (img.src && img.src.startsWith('http')) {
              // 외부 URL은 그대로 두고 프린트 시 브라우저가 처리하도록 함
              console.log('External URL kept as-is for print:', img.src)
              // 변환하지 않고 그대로 유지
            }
          } catch (e) {
            console.warn('Image conversion error:', e)
          }
        })

        await Promise.all(promises)
        return tempDiv.innerHTML
      }

      // text-indent 스타일이 제대로 전달되도록 수정 (모든 em 값에 대해)
      customCSS = customCSS.replace(/text-indent:\s*-[\d\.]+em/g, (match) => match + ' !important')

      if (allContent) {
        // Blob URL만 Base64로 변환
        const convertedContent = await convertBlobImagesToBase64(allContent.innerHTML)


        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>문서 프린트</title>
                <style>
                  @page {
                    size: A4;
                    margin: 5mm 1.5mm;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  }
                  
                  /* 모든 transform과 스케일링 효과 완전 제거 */
                  * {
                    transform: none !important;
                    scale: none !important;
                    zoom: 1 !important;
                  }
                  
                  /* 페이지별 스타일 */
                  .mx-auto {
                    margin: 0 !important;
                    padding: 0 !important;
                    width: 100% !important;
                    max-width: none !important;
                    min-height: 100% !important;
                    transform: none !important;
                    box-shadow: none !important;
                    border: none !important;
                  }
                  
                  ${hasTitle ? `
                  /* 타이틀이 있을 때: 타이틀 페이지만 page-break 적용 */
                  .mx-auto:first-child {
                    page-break-after: always;
                  }
                  
                  /* 내용 페이지는 page-break 없음 */
                  .mx-auto:last-child {
                    page-break-after: auto !important;
                  }
                  
                  /* 타이틀 페이지 레이아웃만 강제 유지 */
                  .mx-auto:first-child > div {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    text-align: center !important;
                    padding-top: 15% !important;
                    height: 100% !important;
                    min-height: 100% !important;
                  }
                  
                  /* 내용 페이지는 기본 정렬로 복원 */
                  .mx-auto:last-child > div {
                    text-align: left !important;
                    align-items: flex-start !important;
                    padding-top: 0 !important;
                  }
                  
                  .mx-auto:first-child h1 {
                    flex: none !important;
                    margin-bottom: 0 !important;
                  }
                  
                  .mx-auto:first-child > div > div {
                    flex: 1 !important;
                    display: flex !important;
                    align-items: center !important;
                  }
                  ` : `
                  /* 타이틀이 없을 때: 내용 페이지만 존재 */
                  .mx-auto {
                    page-break-after: auto !important;
                  }
                  `}
                  
                  /* 미리보기 영역을 프린트용으로 조정 */
                  .mx-auto > div > div {
                    padding: 0.5mm 1.5mm 15mm 1.5mm !important;
                    margin: 0 !important;
                    border: none !important;
                    min-height: auto !important;
                    width: 100% !important;
                    max-width: none !important;
                    box-sizing: border-box !important;
                  }
                  @media print {
                    body {
                      print-color-adjust: exact;
                      -webkit-print-color-adjust: exact;
                    }
                    
                    /* 이미지 프린트 강제 활성화 */
                    img {
                      print-color-adjust: exact !important;
                      -webkit-print-color-adjust: exact !important;
                      color-adjust: exact !important;
                    }
                  }
                  
                  /* 테이블 스타일 */
                  table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0;
                    table-layout: fixed !important;
                  }
                  th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    box-sizing: border-box;
                  }
                  th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                  }
                  
                  
                  
                  /* 커스텀 UL 스타일 - 프린트용 강화 */
                  ul.custom-ul {
                    list-style: none !important;
                    padding: 0 !important;
                    margin: 0 !important;
                  }
                  
                  /* 프린트에서 모든 UL 스타일 강제 적용 */
                  ${customCSS.replace(/}/g, ' !important;}').replace(/!important !important/g, '!important')}
                  
                  /* 페이지의 모든 CSS 스타일 포함 */
                  ${additionalCSS}
                  
                  /* 링크 카드 전용 스타일 */
                  .link-card {
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 8px !important;
                    padding: 12px !important;
                    margin-bottom: 16px !important;
                    display: flex !important;
                    gap: 12px !important;
                    text-decoration: none !important;
                    color: inherit !important;
                    transition: none !important;
                  }
                  
                  .link-card:hover {
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
                  }
                  
                  .link-card img {
                    width: 80px !important;
                    height: 80px !important;
                    object-fit: cover !important;
                    border-radius: 6px !important;
                    flex-shrink: 0 !important;
                    print-color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    display: block !important;
                    max-width: none !important;
                  }
                  
                  @media print {
                    .link-card img {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                      color-adjust: exact !important;
                      opacity: 1 !important;
                      visibility: visible !important;
                      display: block !important;
                    }
                  }
                  
                  .link-card h3 {
                    font-weight: 500 !important;
                    font-size: 14px !important;
                    line-height: 1.4 !important;
                    margin: 0 0 4px 0 !important;
                    color: #1f2937 !important;
                  }
                  
                  .link-card p {
                    font-size: 12px !important;
                    line-height: 1.4 !important;
                    color: #6b7280 !important;
                    margin: 0 0 8px 0 !important;
                  }
                  
                  .link-card .site-name {
                    font-size: 11px !important;
                    color: #9ca3af !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 4px !important;
                  }
                </style>
              </head>
              <body>
                ${convertedContent}
              </body>
            </html>
          `)
          printWindow.document.close()

          // 이미지 로딩 완료를 기다린 후 프린트
          const images = printWindow.document.querySelectorAll('img')
          const imagePromises = Array.from(images).map(img => {
            return new Promise<void>((resolve) => {
              if (img.complete) {
                resolve()
              } else {
                img.onload = () => resolve()
                img.onerror = () => resolve() // 에러도 완료로 처리
                // 타임아웃 설정 (5초 후 강제 진행)
                setTimeout(() => resolve(), 5000)
              }
            })
          })

          console.log(`Waiting for ${images.length} images to load...`)

          // 모든 이미지 로딩 완료 후 프린트
          Promise.all(imagePromises).then(() => {
            console.log('All images loaded, starting print...')
            printWindow.focus()

            // 조금 더 대기 후 프린트 (렌더링 완료 보장)
            setTimeout(() => {
              printWindow.print()
              printWindow.close()
            }, 500)
          })
        }
      }

      setIsPrinting(false)
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
            <Button
              onClick={handlePrint}
              disabled={isPrinting}
              variant="default"
              size="sm"
              className="gap-2 shadow-sm"
            >
              {isPrinting ? (
                <>준비 중...</>
              ) : (
                <>
                  <Printer className="h-4 w-4" />
                  <span>인쇄 / PDF 저장</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 dark:bg-muted/10 w-full" style={{ padding: '20px 0' }}>
        <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {renderTitlePage()}
          <PaginatedPreview content={finalMarkdown} style={style} />
        </div>
      </div>
    </div>
  )
}
