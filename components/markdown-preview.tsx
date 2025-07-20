"use client"

import { useRef } from "react"
import type { DocumentStyle } from "@/lib/default-styles"
import { addNumberingToMarkdown } from "@/lib/numbering"
import { detectStandaloneLinks } from "@/lib/markdown-processor"
import { parseListDepth } from "@/lib/list-depth-parser"
import { PaginatedPreview } from "@/components/paginated-preview"

interface MarkdownPreviewProps {
  markdown: string
  style?: DocumentStyle
}

export function MarkdownPreview({ markdown, style }: MarkdownPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (printRef.current) {
      // 렌더링 영역에서 본문 내용만 추출 (여백 제외)
      const contentDiv = printRef.current.querySelector('div[style*="padding: 10mm"]')
      
      // 현재 페이지의 모든 스타일 추출
      const styleElement = printRef.current.querySelector('style')
      let customCSS = styleElement ? styleElement.textContent : ''
      
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

      // 이미지를 Base64로 변환하는 함수 (CORS 우회 방법 추가)
      const convertImagesToBase64 = async (htmlContent: string): Promise<string> => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        const images = tempDiv.querySelectorAll('img')
        
        const promises = Array.from(images).map(async (img) => {
          try {
            if (img.src && img.src.startsWith('http')) {
              // 방법 1: 프록시 서비스 사용
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(img.src)}`
              
              try {
                const response = await fetch(proxyUrl)
                const blob = await response.blob()
                const dataURL = await new Promise<string>((resolve) => {
                  const reader = new FileReader()
                  reader.onload = () => resolve(reader.result as string)
                  reader.readAsDataURL(blob)
                })
                img.src = dataURL
              } catch (proxyError) {
                console.warn('Proxy conversion failed, trying direct method:', proxyError)
                
                // 방법 2: 직접 변환 시도
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                const newImg = new Image()
                
                await new Promise<void>((resolve) => {
                  newImg.onload = () => {
                    canvas.width = newImg.width
                    canvas.height = newImg.height
                    ctx?.drawImage(newImg, 0, 0)
                    try {
                      const dataURL = canvas.toDataURL('image/png')
                      img.src = dataURL
                    } catch (e) {
                      console.warn('Canvas conversion failed:', e)
                    }
                    resolve()
                  }
                  newImg.onerror = () => {
                    console.warn('Image load failed:', img.src)
                    resolve()
                  }
                  newImg.crossOrigin = 'anonymous'
                  newImg.src = img.src
                })
              }
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
      
      if (contentDiv) {
        // 이미지를 Base64로 변환
        const convertedContent = await convertImagesToBase64(contentDiv.innerHTML)
        
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
                    margin: 10mm;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
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
                  }
                  th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
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
          printWindow.focus()
          printWindow.print()
          printWindow.close()
        }
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
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">문서 미리보기</h2>
            <p className="text-sm text-muted-foreground">현재 스타일: {style.name}</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            프린트 하기
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div ref={printRef}>
          <PaginatedPreview content={finalMarkdown} style={style} />
        </div>
      </div>
    </div>
  )
}
