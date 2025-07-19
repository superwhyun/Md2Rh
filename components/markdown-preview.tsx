"use client"

import type { DocumentStyle } from "@/lib/default-styles"
import { addNumberingToMarkdown } from "@/lib/numbering"
import { PaginatedPreview } from "@/components/paginated-preview"

interface MarkdownPreviewProps {
  markdown: string
  style?: DocumentStyle
}

export function MarkdownPreview({ markdown, style }: MarkdownPreviewProps) {
  if (!style) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">스타일을 선택해주세요</p>
      </div>
    )
  }

  const numberedMarkdown = addNumberingToMarkdown(
    markdown,
    style.headingNumbering?.h1 || 'number',
    style.headingNumbering?.h2 || 'korean',
    style.headingNumbering?.h3 || 'parenthesis'
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b bg-muted/50">
        <div>
          <h2 className="font-semibold">문서 미리보기</h2>
          <p className="text-sm text-muted-foreground">현재 스타일: {style.name}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <PaginatedPreview content={numberedMarkdown} style={style} />
      </div>
    </div>
  )
}
