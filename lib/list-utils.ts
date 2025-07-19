import type { ULLevelStyle } from './default-styles'

export function getListDepth(element: any): number {
  let depth = 0
  let current = element?.parent
  
  while (current) {
    if (current.tagName === 'ul' || current.tagName === 'ol') {
      depth++
    }
    current = current.parent
  }
  
  return depth
}

export function createListItemStyle(level: ULLevelStyle): React.CSSProperties {
  return {
    fontSize: level.fontSize,
    fontFamily: level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily,
    fontWeight: level.fontWeight,
    color: level.color === 'inherit' ? 'inherit' : level.color,
    backgroundColor: level.backgroundColor === 'transparent' ? 'transparent' : level.backgroundColor,
    padding: level.padding,
    marginLeft: level.indentation,
    position: 'relative',
    listStyle: 'none',
    ...(level.boxStyle && {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      margin: '2px 0',
    })
  }
}