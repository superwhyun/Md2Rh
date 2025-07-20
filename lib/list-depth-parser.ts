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
    
    // OL 패턴 매칭 (숫자. 형태) - 완전히 새로운 접근
    const olMatch = line.match(/^(\s*)(\d+\.)\s+(.*)/)
    if (olMatch) {
      const indentText = olMatch[1]
      const content = olMatch[3]
      
      const normalizedIndent = indentText.replace(/\t/g, '    ')
      const depth = Math.floor(normalizedIndent.length / 4)
      
      // ReactMarkdown이 중첩 구조로 인식하도록 표준 들여쓰기 적용
      const standardIndent = '   '.repeat(depth) // 3칸 들여쓰기 (ReactMarkdown 표준)
      processedLines.push(`${standardIndent}1. [OL_DEPTH_${depth}] ${content}`)
      continue
    }
    
    // 다른 라인은 그대로 유지
    processedLines.push(line)
  }
  
  return processedLines.join('\n')
}

// 새로운 함수: OL 마크다운을 실제 중첩 구조로 변환
export function convertToNestedOL(markdown: string): string {
  const lines = markdown.split('\n')
  const result: string[] = []
  const olStack: { depth: number, content: string[] }[] = []
  
  for (const line of lines) {
    const olMatch = line.match(/^(\s*)(\d+\.)\s+(.*)/)
    
    if (olMatch) {
      const indentText = olMatch[1]
      const content = olMatch[3]
      const normalizedIndent = indentText.replace(/\t/g, '    ')
      const depth = Math.floor(normalizedIndent.length / 4)
      
      // 스택에서 현재 깊이보다 깊은 레벨들 제거하고 결과에 추가
      while (olStack.length > 0 && olStack[olStack.length - 1].depth >= depth) {
        const closingLevel = olStack.pop()!
        result.push(...closingLevel.content)
      }
      
      // 현재 아이템 추가
      const standardIndent = '   '.repeat(depth)
      const depthMarker = `[OL_DEPTH_${depth}]`
      
      if (olStack.length === 0 || olStack[olStack.length - 1].depth < depth) {
        // 새로운 레벨 시작
        olStack.push({
          depth,
          content: [`${standardIndent}1. ${depthMarker} ${content}`]
        })
      } else {
        // 같은 레벨에 아이템 추가
        olStack[olStack.length - 1].content.push(`${standardIndent}1. ${depthMarker} ${content}`)
      }
    } else {
      // OL이 아닌 라인 - 스택 비우기
      while (olStack.length > 0) {
        const closingLevel = olStack.pop()!
        result.push(...closingLevel.content)
      }
      result.push(line)
    }
  }
  
  // 마지막에 남은 스택 비우기
  while (olStack.length > 0) {
    const closingLevel = olStack.pop()!
    result.push(...closingLevel.content)
  }
  
  return result.join('\n')
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

export function extractOLDepthFromContent(content: string): number {
  const match = content.match(/\[OL_DEPTH_(\d+)\]/)
  if (match) {
    return parseInt(match[1], 10)
  }
  return 0
}

export function cleanDepthMarkers(content: string): string {
  return content.replace(/\s*\[(UL|OL)_DEPTH_\d+\]\s*/g, ' ').trim()
}