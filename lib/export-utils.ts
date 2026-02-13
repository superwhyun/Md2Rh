import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ImageRun,
  AlignmentType,
  BorderStyle,
} from 'docx'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Blob URL에서 이미지 데이터 가져오기
async function fetchBlobAsArrayBuffer(blobUrl: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(blobUrl)
    if (!response.ok) return null
    return await response.arrayBuffer()
  } catch (error) {
    console.error('Failed to fetch blob:', error)
    return null
  }
}

// 이미지 크기 가져오기
async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1
      resolve({
        width: img.naturalWidth / dpr,
        height: img.naturalHeight / dpr
      })
    }
    img.onerror = () => {
      resolve({ width: 400, height: 300 }) // 기본값
    }
    img.src = src
  })
}

// 마크다운을 DOCX 요소로 파싱
interface ListItem {
  content: string
  level: number
}

interface ParsedElement {
  type: 'heading' | 'paragraph' | 'list' | 'image' | 'table' | 'blockquote' | 'code'
  level?: number
  content?: string
  src?: string
  alt?: string
  items?: string[]
  listItems?: ListItem[]
  ordered?: boolean
  rows?: string[][]
}

function parseMarkdownToElements(markdown: string): ParsedElement[] {
  const lines = markdown.split('\n')
  const elements: ParsedElement[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 빈 줄 건너뛰기
    if (!line.trim()) {
      i++
      continue
    }

    // 제목 (# ~ ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      elements.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2]
      })
      i++
      continue
    }

    // 이미지
    const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)
    if (imageMatch) {
      elements.push({
        type: 'image',
        alt: imageMatch[1],
        src: imageMatch[2]
      })
      i++
      continue
    }

    // 코드 블록
    if (line.startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      elements.push({
        type: 'code',
        content: codeLines.join('\n')
      })
      i++
      continue
    }

    // 인용문
    if (line.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s*/, ''))
        i++
      }
      elements.push({
        type: 'blockquote',
        content: quoteLines.join('\n')
      })
      continue
    }

    // 순서 없는 목록 (중첩 지원)
    if (line.match(/^(\s*)[-*+]\s+/)) {
      const listItems: ListItem[] = []
      while (i < lines.length) {
        const listMatch = lines[i].match(/^(\s*)[-*+]\s+(.*)$/)
        if (!listMatch) break

        const indent = listMatch[1].length
        const level = Math.floor(indent / 2) // 2칸 들여쓰기 = 1레벨
        const content = listMatch[2]

        listItems.push({ content, level })
        i++
      }
      elements.push({
        type: 'list',
        listItems,
        ordered: false
      })
      continue
    }

    // 순서 있는 목록 (중첩 지원)
    if (line.match(/^(\s*)\d+\.\s+/)) {
      const listItems: ListItem[] = []
      while (i < lines.length) {
        const listMatch = lines[i].match(/^(\s*)\d+\.\s+(.*)$/)
        if (!listMatch) break

        const indent = listMatch[1].length
        const level = Math.floor(indent / 2)
        const content = listMatch[2]

        listItems.push({ content, level })
        i++
      }
      elements.push({
        type: 'list',
        listItems,
        ordered: true
      })
      continue
    }

    // 테이블
    if (line.includes('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].includes('|')) {
        const row = lines[i]
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '')

        // 구분선 건너뛰기
        if (!row.every(cell => /^[-:]+$/.test(cell))) {
          rows.push(row)
        }
        i++
      }
      if (rows.length > 0) {
        elements.push({
          type: 'table',
          rows
        })
      }
      continue
    }

    // 일반 문단
    elements.push({
      type: 'paragraph',
      content: line
    })
    i++
  }

  return elements
}

// 텍스트에서 인라인 마크다운 파싱
function parseInlineMarkdown(text: string, fontSize?: number, color?: string, fontFamily?: string): TextRun[] {
  const runs: TextRun[] = []
  let remaining = text

  const baseStyle = {
    size: fontSize,
    color: color,
    font: fontFamily
  }

  // 단순화된 처리 - Bold 처리
  if (remaining.trim()) {
    const boldParts: { text: string; bold: boolean }[] = []

    const boldRegex = /\*\*(.+?)\*\*/g
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(remaining)) !== null) {
      if (match.index > lastIndex) {
        boldParts.push({ text: remaining.slice(lastIndex, match.index), bold: false })
      }
      boldParts.push({ text: match[1], bold: true })
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < remaining.length) {
      boldParts.push({ text: remaining.slice(lastIndex), bold: false })
    }

    if (boldParts.length === 0) {
      runs.push(new TextRun({ text: remaining, ...baseStyle }))
    } else {
      boldParts.forEach(part => {
        runs.push(new TextRun({ text: part.text, bold: part.bold, ...baseStyle }))
      })
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, ...baseStyle })]
}

// CSS 색상을 hex로 변환
function cssColorToHex(color: string): string {
  if (!color) return '000000'
  if (color.startsWith('#')) return color.replace('#', '')
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0')
      const g = parseInt(match[2]).toString(16).padStart(2, '0')
      const b = parseInt(match[3]).toString(16).padStart(2, '0')
      return `${r}${g}${b}`
    }
  }
  return '000000'
}

// CSS 폰트 크기를 half-points로 변환 (docx는 half-points 사용)
function cssFontSizeToHalfPoints(fontSize: string): number {
  if (!fontSize) return 24 // 12pt 기본값
  const match = fontSize.match(/([\d.]+)(px|pt|rem|em)?/)
  if (!match) return 24
  const value = parseFloat(match[1])
  const unit = match[2] || 'px'
  switch (unit) {
    case 'pt': return value * 2
    case 'px': return Math.round(value * 1.5) // 대략적인 변환
    case 'rem':
    case 'em': return Math.round(value * 24) // 1rem = 12pt = 24 half-points
    default: return 24
  }
}

// DocumentStyle 타입 (import 대신 인라인 정의)
interface DocStyle {
  styles: {
    body?: React.CSSProperties
    h1?: React.CSSProperties
    h2?: React.CSSProperties
    h3?: React.CSSProperties
    h4?: React.CSSProperties
    h5?: React.CSSProperties
    h6?: React.CSSProperties
    p?: React.CSSProperties
    [key: string]: React.CSSProperties | undefined
  }
}

// DOCX로 내보내기
export async function exportToDocx(
  markdown: string,
  title: string,
  coverAuthor?: string,
  coverFooter?: string,
  style?: DocStyle
): Promise<void> {
  const elements = parseMarkdownToElements(markdown)
  const children: (Paragraph | Table)[] = []

  // 표지 페이지
  if (title) {
    children.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 }
      })
    )

    const today = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    children.push(
      new Paragraph({
        text: today,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    )

    if (coverAuthor) {
      children.push(
        new Paragraph({
          text: coverAuthor,
          alignment: AlignmentType.RIGHT,
          spacing: { before: 400 }
        })
      )
    }

    if (coverFooter) {
      children.push(
        new Paragraph({
          text: coverFooter,
          spacing: { before: 200 }
        })
      )
    }

    // 페이지 구분
    children.push(new Paragraph({ text: '', pageBreakBefore: true }))
  }

  // 마크다운 내용 변환
  for (const element of elements) {
    switch (element.type) {
      case 'heading':
        const level = element.level || 1
        const headingKey = `h${level}` as keyof typeof style.styles
        const headingStyle = style?.styles?.[headingKey]

        const headingFontSize = headingStyle?.fontSize
          ? cssFontSizeToHalfPoints(headingStyle.fontSize as string)
          : [48, 36, 28, 24, 22, 20][level - 1] // 기본 크기

        const headingColor = headingStyle?.color
          ? cssColorToHex(headingStyle.color as string)
          : '000000'

        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content || '',
                bold: true,
                size: headingFontSize,
                color: headingColor,
                font: headingStyle?.fontFamily as string || undefined
              })
            ],
            spacing: { before: 240, after: 120 }
          })
        )
        break

      case 'paragraph':
        const pStyle = style?.styles?.p
        const pFontSize = pStyle?.fontSize
          ? cssFontSizeToHalfPoints(pStyle.fontSize as string)
          : 24
        const pColor = pStyle?.color
          ? cssColorToHex(pStyle.color as string)
          : '000000'

        children.push(
          new Paragraph({
            children: parseInlineMarkdown(element.content || '', pFontSize, pColor, pStyle?.fontFamily as string),
            spacing: { after: 120 }
          })
        )
        break

      case 'image':
        if (element.src) {
          try {
            const imageData = await fetchBlobAsArrayBuffer(element.src)
            if (imageData) {
              const dimensions = await getImageDimensions(element.src)
              // 최대 너비 500px로 제한, 비율 유지
              const maxWidth = 500
              let width = dimensions.width
              let height = dimensions.height
              if (width > maxWidth) {
                height = (height * maxWidth) / width
                width = maxWidth
              }

              children.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageData,
                      transformation: {
                        width,
                        height
                      },
                      type: 'png'
                    })
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 120, after: 120 }
                })
              )
            }
          } catch (error) {
            console.error('Failed to add image:', error)
            children.push(
              new Paragraph({
                text: `[이미지: ${element.alt || element.src}]`,
                spacing: { after: 120 }
              })
            )
          }
        }
        break

      case 'list':
        // 새로운 listItems 형식 지원 (중첩 목록)
        if (element.listItems && element.listItems.length > 0) {
          element.listItems.forEach((item) => {
            const level = Math.min(item.level, 4) // 최대 5레벨까지 지원
            children.push(
              new Paragraph({
                children: parseInlineMarkdown(item.content),
                bullet: element.ordered ? undefined : { level },
                numbering: element.ordered ? { reference: 'default-numbering', level } : undefined,
                spacing: { after: 60 }
              })
            )
          })
        }
        // 기존 items 형식도 지원 (호환성)
        else if (element.items && element.items.length > 0) {
          element.items.forEach((item) => {
            children.push(
              new Paragraph({
                children: parseInlineMarkdown(item),
                bullet: element.ordered ? undefined : { level: 0 },
                numbering: element.ordered ? { reference: 'default-numbering', level: 0 } : undefined,
                spacing: { after: 60 }
              })
            )
          })
        }
        break

      case 'blockquote':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content || '',
                italics: true
              })
            ],
            indent: { left: 720 },
            border: {
              left: { style: BorderStyle.SINGLE, size: 24, color: '999999' }
            },
            spacing: { before: 120, after: 120 }
          })
        )
        break

      case 'code':
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: element.content || '',
                font: 'Courier New',
                size: 20
              })
            ],
            shading: { fill: 'F5F5F5' },
            spacing: { before: 120, after: 120 }
          })
        )
        break

      case 'table':
        if (element.rows && element.rows.length > 0) {
          const columnCount = element.rows[0]?.length || 1
          const columnWidth = Math.floor(100 / columnCount)

          const table = new Table({
            rows: element.rows.map((row, rowIndex) =>
              new TableRow({
                children: row.map(cell =>
                  new TableCell({
                    children: [new Paragraph({ text: cell })],
                    shading: rowIndex === 0 ? { fill: 'E0E0E0' } : undefined,
                    width: { size: columnWidth, type: WidthType.PERCENTAGE }
                  })
                )
              })
            ),
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: Array(columnCount).fill(Math.floor(9638 / columnCount)) // 9638 = A4 width in twips minus margins
          })
          children.push(table)
        }
        break
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children
    }],
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [
          { level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.START },
          { level: 1, format: 'lowerLetter', text: '%2)', alignment: AlignmentType.START },
          { level: 2, format: 'lowerRoman', text: '%3.', alignment: AlignmentType.START },
          { level: 3, format: 'decimal', text: '(%4)', alignment: AlignmentType.START },
          { level: 4, format: 'lowerLetter', text: '(%5)', alignment: AlignmentType.START }
        ]
      }]
    }
  })

  const blob = await Packer.toBlob(doc)
  const fileName = title?.trim() ? `${title.trim()}.docx` : '문서.docx'
  saveAs(blob, fileName)
}

// 마크다운 + 이미지를 ZIP으로 내보내기
export async function exportToZip(
  markdown: string,
  title: string,
  coverAuthor?: string,
  coverFooter?: string
): Promise<void> {
  const zip = new JSZip()

  // blob URL 찾기
  const blobImageRegex = /!\[([^\]]*)\]\((blob:[^)]+)\)/g
  let processedMarkdown = markdown
  const images: { filename: string; url: string }[] = []

  let match
  let imageIndex = 0

  while ((match = blobImageRegex.exec(markdown)) !== null) {
    const alt = match[1] || `image_${imageIndex}`
    const blobUrl = match[2]
    const filename = `images/${alt.replace(/[^a-zA-Z0-9_-]/g, '_')}_${imageIndex}.png`

    images.push({ filename, url: blobUrl })

    // 마크다운 내 경로 변경
    processedMarkdown = processedMarkdown.replace(
      match[0],
      `![${alt}](${filename})`
    )

    imageIndex++
  }

  // 메타데이터 추가 (제목, 작성자 등)
  let finalMarkdown = ''

  if (title || coverAuthor || coverFooter) {
    finalMarkdown += '---\n'
    if (title) finalMarkdown += `title: "${title}"\n`
    if (coverAuthor) finalMarkdown += `author: "${coverAuthor}"\n`
    if (coverFooter) finalMarkdown += `abstract: "${coverFooter}"\n`
    finalMarkdown += `date: "${new Date().toISOString().split('T')[0]}"\n`
    finalMarkdown += '---\n\n'
  }

  finalMarkdown += processedMarkdown

  // 마크다운 파일 추가
  const mdFilename = title?.trim() ? `${title.trim()}.md` : 'document.md'
  zip.file(mdFilename, finalMarkdown)

  // 이미지 파일 추가
  const imagesFolder = zip.folder('images')

  for (const image of images) {
    try {
      const response = await fetch(image.url)
      if (response.ok) {
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const filename = image.filename.replace('images/', '')
        imagesFolder?.file(filename, arrayBuffer)
      }
    } catch (error) {
      console.error(`Failed to fetch image ${image.filename}:`, error)
    }
  }

  // ZIP 생성 및 다운로드
  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const zipFilename = title?.trim() ? `${title.trim()}.zip` : 'document.zip'
  saveAs(zipBlob, zipFilename)
}
