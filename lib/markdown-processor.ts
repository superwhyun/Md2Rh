export function processMarkdownForULDepth(markdown: string): string {
  const lines = markdown.split('\n')
  let processedLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const match = line.match(/^(\s*)[-*+]\s+(.*)/)
    
    if (match) {
      const indentation = match[1]
      const content = match[2]
      const depth = Math.floor(indentation.length / 4) // 4 spaces = 1 depth level
      
      processedLines.push(`${indentation}- [DEPTH:${depth}] ${content}`)
    } else {
      processedLines.push(line)
    }
  }
  
  return processedLines.join('\n')
}

export function detectStandaloneLinks(markdown: string): { text: string, links: string[] } {
  const lines = markdown.split('\n')
  const standaloneUrlRegex = /^https?:\/\/[^\s]+$/
  const markdownLinkRegex = /^\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/
  const detectedLinks: string[] = []
  const processedLines: string[] = []
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 독립적인 URL 체크
    if (standaloneUrlRegex.test(trimmedLine)) {
      detectedLinks.push(trimmedLine)
      processedLines.push(`[LINK_CARD:${trimmedLine}]`)
    }
    // 마크다운 링크 형태 체크 [text](url)
    else if (markdownLinkRegex.test(trimmedLine)) {
      const match = trimmedLine.match(markdownLinkRegex)
      if (match) {
        const url = match[2]
        detectedLinks.push(url)
        processedLines.push(`[LINK_CARD:${url}]`)
      } else {
        processedLines.push(line)
      }
    } else {
      processedLines.push(line)
    }
  }
  
  return {
    text: processedLines.join('\n'),
    links: detectedLinks
  }
}