"use client"

import { useRef } from "react"
import type { DocumentStyle } from "@/lib/default-styles"
import { addNumberingToMarkdown } from "@/lib/numbering"
import { detectStandaloneLinks } from "@/lib/markdown-processor"
import { PaginatedPreview } from "@/components/paginated-preview"

interface MarkdownPreviewProps {
  markdown: string
  style?: DocumentStyle
}

export function MarkdownPreview({ markdown, style }: MarkdownPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      // 렌더링 영역에서 본문 내용만 추출 (여백 제외)
      const contentDiv = printRef.current.querySelector('div[style*="padding: 10mm"]')
      // 현재 페이지의 스타일 시트에서 커스텀 CSS 추출
      const styleElement = printRef.current.querySelector('style')
      let customCSS = styleElement ? styleElement.textContent : ''
      
      // text-indent 스타일이 제대로 전달되도록 수정 (모든 em 값에 대해)
      customCSS = customCSS.replace(/text-indent:\s*-[\d\.]+em/g, (match) => match + ' !important')
      
      if (contentDiv) {
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
                </style>
              </head>
              <body>
                ${contentDiv.innerHTML}
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
    style.headingNumbering?.h3 || 'parenthesis'
  )

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
          <PaginatedPreview content={numberedMarkdown} style={style} />
        </div>
      </div>
    </div>
  )
}
