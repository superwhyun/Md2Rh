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