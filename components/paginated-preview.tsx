"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { DocumentStyle } from "@/lib/default-styles"
import { parseListDepth, extractDepthFromContent, cleanDepthMarkers } from "@/lib/list-depth-parser"
import { LinkCard } from "@/components/link-card"

interface PaginatedPreviewProps {
  content: string
  style: DocumentStyle
}

export function PaginatedPreview({ content, style }: PaginatedPreviewProps) {
  // 링크 카드 처리를 위한 함수
  const processContentWithLinkCards = (text: string) => {
    const linkCardRegex = /\[LINK_CARD:(https?:\/\/[^\]]+)\]/g
    const parts = []
    let lastIndex = 0
    let match
    
    while ((match = linkCardRegex.exec(text)) !== null) {
      // 링크 카드 앞의 일반 텍스트 추가
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index).trim()
        if (beforeText) {
          parts.push({ type: 'markdown', content: beforeText })
        }
      }
      
      // 링크 카드 추가
      parts.push({ type: 'linkCard', content: match[1] })
      lastIndex = match.index + match[0].length
    }
    
    // 마지막 남은 텍스트 추가
    if (lastIndex < text.length) {
      const afterText = text.slice(lastIndex).trim()
      if (afterText) {
        parts.push({ type: 'markdown', content: afterText })
      }
    }
    
    return parts.length > 0 ? parts : [{ type: 'markdown', content: text }]
  }

  const getDefaultULLevels = () => [
    { marker: '□', fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, markerSpacing: '1em' },
    { marker: 'o', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: '#ffffff', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em' },
    { marker: '▪', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em' },
    { marker: '▫', fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em' },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, markerSpacing: '0.3em' }
  ]

  const ulLevels = style.listCustomization?.ulLevels || getDefaultULLevels()
  
  // 디버깅: UL 레벨 설정 확인
  console.log('UL Levels:', ulLevels)
  console.log('Style listCustomization:', style.listCustomization)

  const generateULLevelCSS = (levels: typeof ulLevels) => {
    const ulCSS = levels.map((level, index) => {
      // 마커 너비 고정 (대략적인 계산)
      const markerWidth = level.marker.length * 0.6 // em 단위
      const spacing = level.markerSpacing || '0.3em'
      
      return `
      .custom-ul .ul-level-${index} {
        position: relative;
        margin-left: ${level.indentation};
        padding-left: calc(${markerWidth}em + ${spacing});
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
        background-color: ${level.backgroundColor === 'transparent' ? 'transparent' : level.backgroundColor};
        ${level.padding !== '0' ? `padding: ${level.padding};` : ''}
        ${level.boxStyle ? `
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin: 2px 0;
          padding: 4px 8px;
          background-color: #f9f9f9;
        ` : ''}
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
        position: relative;
      }
      ` : ''}
    `}).join('\n')
    
    // 디버깅: 생성된 CSS 확인
    console.log('Generated UL CSS:', ulCSS)
    
    return ulCSS
  }

  return (
    <div className="mx-auto bg-white shadow-lg" style={{
      width: '210mm',
      minHeight: '297mm',
      maxWidth: '100%',
      padding: '0',
      boxSizing: 'border-box',
      transform: 'scale(0.8)',
      transformOrigin: 'top center',
      position: 'relative'
    }}>
      <style>
        {generateULLevelCSS(ulLevels)}
      </style>
      <div style={{ 
        ...style.styles.body, 
        padding: '10mm',
        border: '1px dashed #ccc',
        margin: '10mm',
        minHeight: 'calc(297mm - 20mm)',
        boxSizing: 'border-box',
        overflow: 'visible'
      }}>
{processContentWithLinkCards(parseListDepth(content)).map((part, index) => {
          if (part.type === 'linkCard') {
            return <LinkCard key={index} url={part.content} />
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
                  p: ({ children }) => <p style={style.styles.p}>{children}</p>,
                  blockquote: ({ children }) => <blockquote style={style.styles.blockquote}>{children}</blockquote>,
                  ul: ({ children }) => (
                    <ul style={{ ...style.styles.ul, listStyleType: 'none', padding: 0, margin: 0 }} className="custom-ul">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol style={{ listStyleType: 'decimal', paddingLeft: '1.2em' }}>
                      {children}
                    </ol>
                  ),
                  li: ({ children, ...props }) => {
                    const isOrderedList = props.ordered
                    if (isOrderedList) {
                      const additionalText = style.listCustomization?.olMarker || ''
                      return (
                        <li>
                          {children}
                          {additionalText && <span style={{ marginLeft: '0.5em' }}>{additionalText}</span>}
                        </li>
                      )
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
                        if (typeof child === 'string') return cleanDepthMarkers(child)
                        if (React.isValidElement(child)) return React.cloneElement(child, { ...child.props, children: typeof child.props.children === 'string' ? cleanDepthMarkers(child.props.children) : child.props.children })
                        return child
                      })
                      return <li style={style.styles.li} className={`ul-level-${depth}`}>{cleanedChildren}</li>
                    }
                  },
                  table: ({ children }) => (
                    <table style={{ borderCollapse: 'collapse', width: '100%', margin: '1rem 0' }}>
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => <thead>{children}</thead>,
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => <tr>{children}</tr>,
                  th: ({ children }) => (
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left' }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>
                      {children}
                    </td>
                  ),
                  code: ({ inline, children, ...props }) => {
                    return inline ? (
                      <code style={style.styles.code} {...props}>
                        {children}
                      </code>
                    ) : (
                      <div style={style.styles.pre}>
                        <pre style={{ margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                          <code>{children}</code>
                        </pre>
                      </div>
                    )
                  },
                  strong: ({ children }) => <strong style={style.styles.strong}>{children}</strong>,
                  em: ({ children }) => <em style={style.styles.em}>{children}</em>,
                  a: ({ children, href }) => (
                    <a href={href} style={style.styles.a}>
                      {children}
                    </a>
                  ),
                }}
              >
                {part.content}
              </ReactMarkdown>
            )
          }
        })}
      </div>
    </div>
  )
}