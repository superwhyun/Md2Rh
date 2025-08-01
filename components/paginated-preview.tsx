"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { DocumentStyle } from "@/lib/default-styles"
import { extractDepthFromContent, cleanDepthMarkers } from "@/lib/list-depth-parser"
import { parseTableWidths } from "@/lib/table-width-parser"
import { LinkCard } from "@/components/link-card"

interface PaginatedPreviewProps {
  content: string
  style: DocumentStyle
}

export function PaginatedPreview({ content, style }: PaginatedPreviewProps) {
  if (!style) {
    return <div>Loading...</div>
  }

  // 테이블 너비 정보를 간단하게 관리 - 전역 변수로 변경
  const tableWidthsRef = React.useRef<string[]>([])
  const columnIndexRef = React.useRef<number>(0)

  // 링크 카드 처리를 위한 함수
  const processContentWithLinkCards = (text: string) => {
    
    // 링크 카드와 blob 이미지 모두 처리
    const linkCardRegex = /\[LINK_CARD:(https?:\/\/[^\]]+)\]/g
    const blobImageRegex = /!\[([^\]]*)\]\((blob:[^)]+)\)/g
    
    const parts = []
    let lastIndex = 0
    
    // 모든 매치를 찾아서 위치순으로 정렬
    const allMatches = []
    
    let match
    while ((match = linkCardRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'linkCard',
        index: match.index,
        length: match[0].length,
        content: match[1]
      })
    }
    
    // blob 이미지 매치 추가
    while ((match = blobImageRegex.exec(text)) !== null) {
      allMatches.push({
        type: 'blobImage',
        index: match.index,
        length: match[0].length,
        alt: match[1],
        src: match[2]
      })
    }
    
    // 위치순으로 정렬
    allMatches.sort((a, b) => a.index - b.index)
    
    // 순서대로 처리
    for (const match of allMatches) {
      // 이전 텍스트 추가
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index).trim()
        if (beforeText) {
          parts.push({ type: 'markdown', content: beforeText })
        }
      }
      
      // 매치된 항목 추가
      if (match.type === 'linkCard') {
        parts.push({ type: 'linkCard', content: match.content })
      } else if (match.type === 'blobImage') {
        parts.push({ type: 'blobImage', alt: match.alt, src: match.src })
      }
      
      lastIndex = match.index + match.length
    }
    
    // 마지막 남은 텍스트 추가
    if (lastIndex < text.length) {
      const afterText = text.slice(lastIndex).trim()
      if (afterText) {
        parts.push({ type: 'markdown', content: afterText })
      }
    }
    
    const result = parts.length > 0 ? parts : [{ type: 'markdown', content: text }]
    return result
  }

  const getDefaultULLevels = () => [
    { marker: '□', fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, markerSpacing: '1em', bottomMargin: '1rem' },
    { marker: 'o', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: '#ffffff', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '▪', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '▫', fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, markerSpacing: '0.3em', bottomMargin: '1rem' }
  ]

  const getDefaultOLLevels = () => [
    { fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' }
  ]




  const ulLevels = style.listCustomization?.ulLevels || getDefaultULLevels()
  const olLevels = style.listCustomization?.olLevels || getDefaultOLLevels()
  


  const generateULLevelCSS = (levels: typeof ulLevels) => {
    const ulCSS = levels.map((level, index) => {
      // 마커 너비 고정 (대략적인 계산)
      const markerWidth = level.marker.length * 0.6 // em 단위
      const spacing = level.markerSpacing || '0.3em'
      
      return `
      .custom-ul .ul-level-${index} {
        position: relative;
        margin-left: ${level.indentation};
        margin-bottom: ${level.bottomMargin || '1rem'};
        padding-left: calc(${markerWidth}em + ${spacing});
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
        background-color: ${level.backgroundColor === 'transparent' ? 'transparent' : level.backgroundColor};
        ${level.boxStyle ? `
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin: 2px 0 ${level.bottomMargin || '1rem'} 0;
          padding-top: ${level.padding !== '0' ? level.padding : '4px'};
          padding-bottom: ${level.padding !== '0' ? level.padding : '4px'};
          padding-right: 8px;
          background-color: #f9f9f9;
        ` : level.padding !== '0' ? `padding: ${level.padding};` : ''}
      }
      
      .custom-ul .ul-level-${index}::before {
        content: "${level.marker}";
        position: absolute;
        left: 0;
        top: 0;
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
        width: ${markerWidth}em;
      }
      
      ${level.boxStyle ? `
      .custom-ul .ul-level-${index} ul {
        margin-left: -8px;
        margin-top: 4px;
        margin-bottom: ${level.bottomMargin || '1rem'};
        position: relative;
      }
      ` : `
      .custom-ul .ul-level-${index} ul {
        margin-bottom: ${level.bottomMargin || '1rem'};
      }
      `}
    `}).join('\n')
    
    return ulCSS
  }

  const generateOLLevelCSS = (levels: typeof olLevels) => {
    const olCSS = levels.map((level, index) => {
      const spacing = level.numberSpacing || '0.3em'
      
      return `
      .custom-ol .ol-level-${index} {
        position: relative;
        margin-left: ${level.indentation};
        margin-bottom: ${level.bottomMargin || '1rem'};
        padding-left: ${spacing};
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
        background-color: ${level.backgroundColor === 'transparent' ? 'transparent' : level.backgroundColor};
        ${level.boxStyle ? `
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin: 2px 0 ${level.bottomMargin || '1rem'} 0;
          padding-top: ${level.padding !== '0' ? level.padding : '4px'};
          padding-bottom: ${level.padding !== '0' ? level.padding : '4px'};
          padding-right: 8px;
          background-color: #f9f9f9;
        ` : level.padding !== '0' ? `padding: ${level.padding};` : ''}
      }
      
      ${level.boxStyle ? `
      .custom-ol .ol-level-${index} ol {
        margin-left: -8px;
        margin-top: 4px;
        margin-bottom: ${level.bottomMargin || '1rem'};
        position: relative;
      }
      ` : `
      .custom-ol .ol-level-${index} ol {
        margin-bottom: ${level.bottomMargin || '1rem'};
      }
      `}
    `}).join('\n')
    
    return olCSS
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
      <div className="bg-white shadow-lg" style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '0',
        boxSizing: 'border-box',
        transform: 'scale(0.75)',
        transformOrigin: 'top center',
        position: 'relative'
      }}>
      <style>
        {generateULLevelCSS(ulLevels)}
        {generateOLLevelCSS(olLevels)}
      </style>
      <div 
        style={{ 
          ...style.styles.body, 
          padding: '10mm',
          border: '1px dashed #ccc',
          margin: '10mm',
          minHeight: 'calc(297mm - 20mm)',
          boxSizing: 'border-box',
          overflow: 'visible'
        }}>
{processContentWithLinkCards(content).map((part, index) => {
          if (part.type === 'linkCard') {
            return <LinkCard key={index} url={part.content} />
          } else if (part.type === 'blobImage') {
            return (
              <img 
                key={index}
                src={part.src} 
                alt={part.alt || ''} 
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '1rem 0',
                  display: 'block'
                }}
                onError={(e) => {}}
                onLoad={() => {}}
              />
            )
          } else {
            return (
              <ReactMarkdown
                key={index}
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 style={style.styles.h1}>{children}</h1>,
                  h2: ({ children }) => <h2 style={style.styles.h2}>{children}</h2>,
                  h3: ({ children }) => <h3 style={style.styles.h3}>{children}</h3>,
                  h4: ({ children }) => <h4 style={style.styles.h4}>{children}</h4>,
                  h5: ({ children }) => <h5 style={style.styles.h5}>{children}</h5>,
                  h6: ({ children }) => <h6 style={style.styles.h6}>{children}</h6>,
                  p: ({ children, node }) => {
                    // li 태그 내부의 p 태그인지 확인
                    const isInListItem = node?.parent?.tagName === 'li'
                    const pStyle = isInListItem 
                      ? { ...style.styles.p, margin: '0.2rem 0' }
                      : style.styles.p
                    return <p style={pStyle}>{children}</p>
                  },
                  blockquote: ({ children }) => <blockquote style={style.styles.blockquote}>{children}</blockquote>,
                  ul: ({ children }) => {
                    // 첫 번째 레벨(depth 0)의 bottomMargin 사용
                    const bottomMargin = ulLevels[0]?.bottomMargin || '1rem'
                    
                    // loose list 감지: 자식 중에 p 태그가 있는 li가 있는지 확인
                    const hasLooseItems = React.Children.toArray(children).some(child => {
                      if (React.isValidElement(child) && child.type === 'li') {
                        return React.Children.toArray(child.props.children).some(grandchild => 
                          React.isValidElement(grandchild) && grandchild.type === 'p'
                        )
                      }
                      return false
                    })
                    
                    // loose list일 때는 bottomMargin을 절반으로 줄임
                    const adjustedBottomMargin = hasLooseItems 
                      ? `${parseFloat(bottomMargin) / 2}rem` 
                      : bottomMargin
                    
                    return (
                    <ul style={{ ...style.styles.ul, listStyleType: 'none', padding: 0, margin: `0 0 ${adjustedBottomMargin} 0` }} className="custom-ul">
                      {React.Children.map(children, (child) => {
                        return React.isValidElement(child)
                          ? React.cloneElement(child, { 'data-ul': true })
                          : child
                      })}
                    </ul>
                    )
                  },
                  ol: ({ children }) => {
                    // 첫 번째 레벨(depth 0)의 bottomMargin 사용
                    const bottomMargin = olLevels[0]?.bottomMargin || '1rem'
                    
                    // loose list 감지: 자식 중에 p 태그가 있는 li가 있는지 확인
                    const hasLooseItems = React.Children.toArray(children).some(child => {
                      if (React.isValidElement(child) && child.type === 'li') {
                        return React.Children.toArray(child.props.children).some(grandchild => 
                          React.isValidElement(grandchild) && grandchild.type === 'p'
                        )
                      }
                      return false
                    })
                    
                    // loose list일 때는 bottomMargin을 절반으로 줄임
                    const adjustedBottomMargin = hasLooseItems 
                      ? `${parseFloat(bottomMargin) / 2}rem` 
                      : bottomMargin
                    
                    return (
                    <ol style={{ ...style.styles.ol, listStyle: 'decimal', margin: `0 0 ${adjustedBottomMargin} 0` }} className="custom-ol">
                      {React.Children.map(children, (child) => {
                        return React.isValidElement(child)
                          ? React.cloneElement(child, { 'data-ol': true })
                          : child
                      })}
                    </ol>
                    )
                  },
                  li: ({ children, ...props }) => {
                    const isOrderedList = props['data-ol']
                    if (isOrderedList) {
                      const firstChild = React.Children.toArray(children)[0]
                      let depth = 0
                      if (typeof firstChild === 'string') {
                        depth = extractDepthFromContent(firstChild)
                      } else if (React.isValidElement(firstChild) && firstChild.props.children) {
                        const text = typeof firstChild.props.children === 'string' ? firstChild.props.children : ''
                        depth = extractDepthFromContent(text)
                      }
                      const cleanedChildren = React.Children.map(children, (child) => {
                        if (typeof child === 'string') {
                          return cleanDepthMarkers(child)
                        }
                        if (React.isValidElement(child)) {
                          return React.cloneElement(child, { 
                            ...child.props, 
                            children: typeof child.props.children === 'string' 
                              ? cleanDepthMarkers(child.props.children) 
                              : React.Children.map(child.props.children, (grandchild) => 
                                  typeof grandchild === 'string' ? cleanDepthMarkers(grandchild) : grandchild
                                )
                          })
                        }
                        return child
                      })
                      return <li style={style.styles.li} className={`ol-level-${depth}`}>{cleanedChildren}</li>
                    } else {
                      const firstChild = React.Children.toArray(children)[0]
                      let depth = 0
                      if (typeof firstChild === 'string') {
                        depth = extractDepthFromContent(firstChild)
                      } else if (React.isValidElement(firstChild) && firstChild.props.children) {
                        const text = typeof firstChild.props.children === 'string' ? firstChild.props.children : ''
                        depth = extractDepthFromContent(text)
                      }
                      const cleanedChildren = React.Children.map(children, (child) => {
                        if (typeof child === 'string') {
                          return cleanDepthMarkers(child)
                        }
                        if (React.isValidElement(child)) {
                          return React.cloneElement(child, { 
                            ...child.props, 
                            children: typeof child.props.children === 'string' 
                              ? cleanDepthMarkers(child.props.children) 
                              : React.Children.map(child.props.children, (grandchild) => 
                                  typeof grandchild === 'string' ? cleanDepthMarkers(grandchild) : grandchild
                                )
                          })
                        }
                        return child
                      })
                      return <li style={style.styles.li} className={`ul-level-${depth}`}>{cleanedChildren}</li>
                    }
                  },
                  table: ({ children }) => {
                    // 새 테이블 시작 시 너비 정보 초기화
                    tableWidthsRef.current = []
                    columnIndexRef.current = 0
                    
                    return (
                      <table style={{ 
                        ...style.styles.table, 
                        tableLayout: 'fixed' // 정확한 너비 적용을 위해 필요
                      }}>
                        {children}
                      </table>
                    )
                  },
                  thead: ({ children }) => <thead>{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => {
                    // 새 행 시작 시 열 인덱스 리셋
                    columnIndexRef.current = 0
                    return <tr>{children}</tr>
                  },
                  th: ({ children }) => {
                    
                    // 파서 로직을 먼저 실행 (스타일 체크 이전에)
                    const childrenStr = React.Children.toArray(children).map(child => {
                      if (typeof child === 'string') return child
                      if (typeof child === 'number') return child.toString()
                      if (React.isValidElement(child)) {
                        // React 엘리먼트인 경우 props.children을 확인
                        return child.props?.children || ''
                      }
                      return ''
                    }).join('')
                    
                    // 파서를 사용해서 너비 정보 추출
                    const widthMatch = childrenStr.match(/\{\{(\d+(?:\.\d+)?%)\}\}/)
                    let cleanChildren = childrenStr
                    
                    if (widthMatch) {
                      const percentage = parseFloat(widthMatch[1].replace('%', ''))
                      if (percentage > 0 && percentage <= 100) {
                        // 현재 테이블의 너비 정보에 추가
                        tableWidthsRef.current.push(widthMatch[1])
                        // {{30%}} 부분을 제거한 깔끔한 텍스트
                        cleanChildren = childrenStr.replace(/\{\{(\d+(?:\.\d+)?%)\}\}/, '').trim()
                      } else {
                        // 잘못된 값이면 auto 추가
                        tableWidthsRef.current.push('auto')
                        cleanChildren = childrenStr.replace(/\{\{(\d+(?:\.\d+)?%)\}\}/, '').trim()
                      }
                    } else {
                      // 너비 지정이 없으면 auto 추가
                      tableWidthsRef.current.push('auto')
                    }
                    
                    // 안전한 기본값 설정
                    const defaultThStyle = {
                      border: '1px solid #ddd',
                      padding: '8px',
                      backgroundColor: '#f2f2f2',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      verticalAlign: 'middle'
                    }
                    
                    // 스타일이 존재하는지 확인
                    if (!style || !style.styles || !style.styles.th) {
                      return <th style={defaultThStyle}>{cleanChildren && cleanChildren.trim() ? cleanChildren : children}</th>
                    }
                    
                    const thStyle = style.styles.th as any
                    const finalStyle = { ...defaultThStyle, ...thStyle }
                    
                    // 새로운 테두리 속성이 있으면 적용
                    if (thStyle.borderWidth || thStyle.borderStyle || thStyle.borderColor) {
                      const borderWidth = thStyle.borderWidth || '1px'
                      const borderStyle = thStyle.borderStyle || 'solid'  
                      const borderColor = thStyle.borderColor || '#ddd'
                      finalStyle.border = `${borderWidth} ${borderStyle} ${borderColor}`
                    }
                    
                    return <th style={finalStyle}>{cleanChildren && cleanChildren.trim() ? cleanChildren : children}</th>
                  },
                  td: ({ children }) => {
                    // 안전한 기본값 설정
                    const defaultTdStyle = {
                      border: '1px solid #ddd',
                      padding: '8px',
                      textAlign: 'left',
                      verticalAlign: 'middle'
                    }
                    
                    // 스타일이 존재하는지 확인
                    if (!style || !style.styles || !style.styles.td) {
                      // TD에서도 width 적용 로직을 early return 이전에 실행
                      let finalTdStyle = defaultTdStyle
                      if (tableWidthsRef.current.length > 0 && columnIndexRef.current < tableWidthsRef.current.length) {
                        const width = tableWidthsRef.current[columnIndexRef.current]
                        if (width !== 'auto') {
                          finalTdStyle = { ...defaultTdStyle, width: width, minWidth: '50px' }
                        }
                      }
                      columnIndexRef.current++
                      return <td style={finalTdStyle}>{children}</td>
                    }
                    
                    const tdStyle = style.styles.td as any
                    const finalStyle = { ...defaultTdStyle, ...tdStyle }
                    
                    // 새로운 테두리 속성이 있으면 적용
                    if (tdStyle.borderWidth || tdStyle.borderStyle || tdStyle.borderColor) {
                      const borderWidth = tdStyle.borderWidth || '1px'
                      const borderStyle = tdStyle.borderStyle || 'solid'
                      const borderColor = tdStyle.borderColor || '#ddd'
                      finalStyle.border = `${borderWidth} ${borderStyle} ${borderColor}`
                    }

                    // 현재 열에 해당하는 너비 적용
                    if (tableWidthsRef.current.length > 0 && columnIndexRef.current < tableWidthsRef.current.length) {
                      const width = tableWidthsRef.current[columnIndexRef.current]
                      console.log(`TD DEBUG: width=${width}`)
                      if (width !== 'auto') {
                        finalStyle.width = width
                        finalStyle.minWidth = '50px'
                        console.log(`TD width applied: column ${columnIndexRef.current}, width ${width}`)
                      }
                    }
                    
                    // 다음 열로 이동
                    columnIndexRef.current++
                    
                    return <td style={finalStyle}>{children}</td>
                  },
                  code: ({ inline, children, ...props }) => {
                    // 블록 코드는 보통 pre 태그 안에 들어있거나 여러 줄을 가짐
                    const content = Array.isArray(children) ? children.join('') : children
                    const isBlockCode = typeof content === 'string' && content.includes('\n')
                    
                    return !isBlockCode ? (
                      <code style={style.styles.code} {...props}>
                        {children}
                      </code>
                    ) : (
                      <div style={style.styles.pre}>
                        <pre style={{ margin: 0, fontFamily: style.styles.pre.fontFamily || "monospace", whiteSpace: "pre-wrap" }}>
                          <code>{children}</code>
                        </pre>
                      </div>
                    )
                  },
                  strong: ({ children, ...props }) => {
                    // node 정보에서 앞뒤 공백 확인
                    const hasSpaceBefore = props.node?.position?.start.offset > 0
                    const hasSpaceAfter = props.node?.position?.end.offset < (props.node?.position?.source?.length || 0)
                    
                    return <strong style={style.styles.strong}>{children}</strong>
                  },
                  em: ({ children }) => <em style={style.styles.em}>{children}</em>,
                  a: ({ children, href }) => (
                    <a href={href} style={style.styles.a}>
                      {children}
                    </a>
                  ),
                  img: ({ src, alt, title }) => {
                    console.log('Image src:', src, 'Type:', typeof src)
                    
                    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
                      const img = e.target as HTMLImageElement
                      img.style.border = '2px dashed #ccc'
                      img.style.padding = '20px'
                      img.style.background = '#f5f5f5'
                      img.alt = `[이미지 로드 실패: ${alt || src}]`
                    }

                    const handleImageLoad = () => {}

                    return (
                      <img 
                        src={src} 
                        alt={alt || ''} 
                        title={title || alt || ''}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        style={{
                          maxWidth: '100%',
                          height: 'auto',
                          margin: '1rem 0',
                          display: 'block'
                        }}
                      />
                    )
                  },
                }}
              >
                {part.content}
              </ReactMarkdown>
            )
          }
        })}
      </div>
      </div>
    </div>
  )
}