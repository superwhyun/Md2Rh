export interface TableWidthInfo {
  widths: string[]
  cleanHeaders: string[]
  hasWidthInfo: boolean
}

/**
 * 테이블 마크다운에서 {{20%}} 형태의 너비 정보를 파싱합니다.
 * 
 * @param tableMarkdown 테이블이 포함된 마크다운 텍스트
 * @returns 너비 정보와 정리된 헤더 텍스트
 */
export function parseTableWidths(tableMarkdown: string): TableWidthInfo {
  const lines = tableMarkdown.trim().split('\n')
  
  // 테이블 헤더 첫 줄 찾기
  const headerLine = lines.find(line => line.trim().startsWith('|') && line.trim().endsWith('|'))
  
  if (!headerLine) {
    return {
      widths: [],
      cleanHeaders: [],
      hasWidthInfo: false
    }
  }

  // 헤더 셀들 추출 (양끝 | 제거 후 | 로 분할)
  const headerCells = headerLine
    .trim()
    .slice(1, -1) // 양끝 | 제거
    .split('|')
    .map(cell => cell.trim())

  // {{숫자%}} 패턴 정규식 - 안전한 패턴 사용
  const widthPattern = /\{\{(\d+(?:\.\d+)?%)\}\}/

  const widths: string[] = []
  const cleanHeaders: string[] = []
  let hasWidthInfo = false

  // 각 헤더 셀에서 너비 정보 추출
  headerCells.forEach(cell => {
    const match = cell.match(widthPattern)
    
    if (match) {
      const percentage = parseFloat(match[1].replace('%', ''))
      
      // 안전장치: 유효한 퍼센트 값인지 확인 (0-100%)
      if (percentage > 0 && percentage <= 100) {
        widths.push(match[1])
        cleanHeaders.push(cell.replace(widthPattern, '').trim())
        hasWidthInfo = true
      } else {
        // 잘못된 값이면 auto로 처리
        widths.push('auto')
        cleanHeaders.push(cell.replace(widthPattern, '').trim())
      }
    } else {
      widths.push('auto')
      cleanHeaders.push(cell)
    }
  })

  // 추가 안전장치: 헤더가 비어있으면 처리하지 않음
  if (cleanHeaders.every(header => header.trim() === '')) {
    return {
      widths: [],
      cleanHeaders: [],
      hasWidthInfo: false
    }
  }

  return {
    widths,
    cleanHeaders,
    hasWidthInfo
  }
}

/**
 * 마크다운 텍스트에서 테이블을 찾고 너비 정보를 파싱합니다.
 * 
 * @param markdown 전체 마크다운 텍스트
 * @returns 각 테이블의 너비 정보 배열
 */
export function parseAllTableWidths(markdown: string): TableWidthInfo[] {
  const tableResults: TableWidthInfo[] = []
  
  // 테이블 패턴: | 로 시작하는 연속된 줄들
  const tableRegex = /^\|.+\|$/gm
  const tables: string[] = []
  
  const lines = markdown.split('\n')
  let currentTable: string[] = []
  let inTable = false
  
  for (const line of lines) {
    if (tableRegex.test(line.trim())) {
      currentTable.push(line)
      inTable = true
    } else if (inTable && currentTable.length > 0) {
      // 테이블 끝
      tables.push(currentTable.join('\n'))
      currentTable = []
      inTable = false
    }
  }
  
  // 마지막 테이블 처리
  if (currentTable.length > 0) {
    tables.push(currentTable.join('\n'))
  }
  
  // 각 테이블에서 너비 정보 파싱
  tables.forEach(table => {
    tableResults.push(parseTableWidths(table))
  })
  
  return tableResults
}

/**
 * 너비 정보가 포함된 마크다운에서 {{20%}} 패턴을 제거한 깔끔한 마크다운을 반환합니다.
 * 
 * @param markdown 원본 마크다운
 * @returns 너비 정보가 제거된 마크다운
 */
export function cleanTableWidthsFromMarkdown(markdown: string): string {
  // {{숫자%}} 패턴 제거
  return markdown.replace(/\{\{(\d+(?:\.\d+)?%)\}\}/g, '')
}