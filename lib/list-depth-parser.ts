export interface ListItem {
  content: string
  depth: number
  type: 'ul' | 'ol'
  marker: string
}

export function parseListDepth(markdown: string): string {
  const lines = markdown.split('\n')
  const processedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // UL 패턴 매칭 (-, *, + 마커)
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)/)
    if (ulMatch) {
      const indentText = ulMatch[1]
      const marker = ulMatch[2]
      const content = ulMatch[3]

      // 탭을 4칸 공백으로 변환하여 일관된 계산
      const normalizedIndent = indentText.replace(/\t/g, '    ')
      const depth = Math.floor(normalizedIndent.length / 4) // 4칸당 1레벨

      // 특별한 마커로 깊이 정보 포함
      processedLines.push(`${indentText}${marker} [UL_DEPTH_${depth}] ${content}`)
      continue
    }

    // OL 패턴 매칭 (숫자+"."+공백 마커)
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)/)
    if (olMatch) {
      const indentText = olMatch[1]
      const number = olMatch[2]
      const content = olMatch[3]

      // 탭을 4칸 공백으로 변환하여 일관된 계산
      const normalizedIndent = indentText.replace(/\t/g, '    ')
      const depth = Math.floor(normalizedIndent.length / 4) // 4칸당 1레벨

      // 특별한 마커로 깊이 정보 포함
      processedLines.push(`${indentText}${number}. [OL_DEPTH_${depth}] ${content}`)
      continue
    }

    // 다른 라인은 그대로 유지
    processedLines.push(line)
  }

  return processedLines.join('\n')
}


export function extractDepthFromContent(content: string): number {
  const ulMatch = content.match(/\[UL_DEPTH_(\d+)\]/)
  if (ulMatch) {
    return parseInt(ulMatch[1], 10)
  }

  const olMatch = content.match(/\[OL_DEPTH_(\d+)\]/)
  if (olMatch) {
    return parseInt(olMatch[1], 10)
  }

  return 0
}


export function cleanDepthMarkers(content: string): string {
  if (typeof content !== 'string') return content

  // 마커만 제거하고 앞뒤 공백 트리밍은 하지 않음 (인라인 요소 간 공백 보존 위해)
  return content
    .replace(/\[UL_DEPTH_\d+\]/g, '')
    .replace(/\[OL_DEPTH_\d+\]/g, '')
}