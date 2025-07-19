import type { NumberingType } from './default-styles'

export function getNumberingString(type: NumberingType, index: number): string {
  switch (type) {
    case 'number':
      return `${index + 1}. `
    case 'korean':
      const koreanChars = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하']
      return `${koreanChars[index % koreanChars.length]}. `
    case 'parenthesis':
      return `${index + 1}) `
    case 'roman':
      return `${toRoman(index + 1)}. `
    case 'none':
      return ''
    default:
      return ''
  }
}

function toRoman(num: number): string {
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
  
  let result = ''
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += symbols[i]
      num -= values[i]
    }
  }
  return result
}

export function parseMarkdownHeadings(markdown: string) {
  const lines = markdown.split('\n')
  const headings: Array<{ level: number; text: string; line: number }> = []
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2],
        line: index
      })
    }
  })
  
  return headings
}

export function addNumberingToMarkdown(markdown: string, h1Type: NumberingType, h2Type: NumberingType, h3Type: NumberingType): string {
  if (h1Type === 'none' && h2Type === 'none' && h3Type === 'none') {
    return markdown
  }

  const lines = markdown.split('\n')
  const counters = { h1: 0, h2: 0, h3: 0 }
  
  return lines.map(line => {
    const match = line.match(/^(#{1,3})\s+(.+)/)
    if (match) {
      const level = match[1].length
      const text = match[2]
      
      if (level === 1) {
        counters.h1++
        counters.h2 = 0
        counters.h3 = 0
        const prefix = getNumberingString(h1Type, counters.h1 - 1)
        return `# ${prefix}${text}`
      } else if (level === 2) {
        counters.h2++
        counters.h3 = 0
        const prefix = getNumberingString(h2Type, counters.h2 - 1)
        return `## ${prefix}${text}`
      } else if (level === 3) {
        counters.h3++
        const prefix = getNumberingString(h3Type, counters.h3 - 1)
        return `### ${prefix}${text}`
      }
    }
    return line
  }).join('\n')
}