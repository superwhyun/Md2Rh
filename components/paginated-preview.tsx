"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { DocumentStyle } from "@/lib/default-styles"
import { parseListDepth, extractDepthFromContent, cleanDepthMarkers } from "@/lib/list-depth-parser"

interface PaginatedPreviewProps {
  content: string
  style: DocumentStyle
}

export function PaginatedPreview({ content, style }: PaginatedPreviewProps) {


  const getDefaultULLevels = () => [
    { marker: '•', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1.5rem', boxStyle: false, markerSpacing: '0.3em' },
    { marker: '◦', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3rem', boxStyle: false, markerSpacing: '0.3em' },
    { marker: '▪', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '4.5rem', boxStyle: false, markerSpacing: '0.3em' },
    { marker: '▫', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '6rem', boxStyle: false, markerSpacing: '0.3em' },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '7.5rem', boxStyle: false, markerSpacing: '0.3em' }
  ]

  const ulLevels = style.listCustomization?.ulLevels || getDefaultULLevels()
  
  // 디버깅: UL 레벨 설정 확인
  console.log('UL Levels:', ulLevels)
  console.log('Style listCustomization:', style.listCustomization)

  const generateULLevelCSS = (levels: typeof ulLevels) => {
    const ulCSS = levels.map((level, index) => {
      // 마커 너비 추정 (대략적인 계산)
      const markerWidth = level.marker.length * 0.6 // em 단위
      const marginRight = parseFloat(level.markerSpacing || '0.3em') // 사용자 설정 간격 사용
      const totalIndent = markerWidth + marginRight
      
      return `
      ul .ul-level-${index}::before {
        content: "${level.marker}";
        margin-right: ${level.markerSpacing || '0.3em'};
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
        display: inline-block;
        width: ${markerWidth}em;
      }
      
      ul .ul-level-${index} {
        padding-left: ${level.indentation};
        text-indent: -${totalIndent}em;
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
        ` : ''}
      }
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
        <ReactMarkdown
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
          {parseListDepth(content)}
        </ReactMarkdown>
      </div>
    </div>
  )
}