"use client"

import React, { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import type { DocumentStyle } from "@/lib/default-styles"
import { parseListDepth, extractDepthFromContent, cleanDepthMarkers } from "@/lib/list-depth-parser"

interface PaginatedPreviewProps {
  content: string
  style: DocumentStyle
}

export function PaginatedPreview({ content, style }: PaginatedPreviewProps) {
  const [pages, setPages] = useState<string[]>([])

  useEffect(() => {
    // 페이지 분할 로직 (줄 기반)
    const lines = content.split('\n')
    const linesPerPage = 35 // 페이지당 줄 수
    const newPages = []
    if (lines.length > 0) {
      for (let i = 0; i < lines.length; i += linesPerPage) {
        newPages.push(lines.slice(i, i + linesPerPage).join('\n'))
      }
      setPages(newPages)
    } else {
      setPages([''])
    }
  }, [content])

  const getDefaultULLevels = () => [
    { marker: '•', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1.5rem', boxStyle: false },
    { marker: '◦', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3rem', boxStyle: false },
    { marker: '▪', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '4.5rem', boxStyle: false },
    { marker: '▫', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '6rem', boxStyle: false },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '7.5rem', boxStyle: false }
  ]

  const ulLevels = style.listCustomization?.ulLevels || getDefaultULLevels()

  const generateULLevelCSS = (levels: typeof ulLevels) => {
    const ulCSS = levels.map((level, index) => `
      ul .ul-level-${index}::before {
        content: "${level.marker}";
        margin-right: 0.5em;
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
      }
      
      ul .ul-level-${index} {
        margin-left: ${level.indentation};
        font-size: ${level.fontSize};
        font-family: ${level.fontFamily === 'inherit' ? 'inherit' : level.fontFamily};
        font-weight: ${level.fontWeight};
        color: ${level.color === 'inherit' ? 'inherit' : level.color};
        background-color: ${level.backgroundColor === 'transparent' ? 'transparent' : level.backgroundColor};
        padding: ${level.padding};
        ${level.boxStyle ? `
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          margin: 2px 0;
          padding: 4px 8px;
        ` : ''}
      }
    `).join('\n')
    return ulCSS
  }

  const renderMarkdown = (mdContent: string) => (
    <ReactMarkdown
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
      {mdContent}
    </ReactMarkdown>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.025cm' }}>
      {pages.map((pageContent, index) => (
        <div 
          key={index}
          className="mx-auto bg-white shadow-lg"
          style={{
            width: '210mm',
            height: '297mm',
            maxWidth: '100%',
            padding: '0',
            boxSizing: 'border-box',
            transform: 'scale(0.8)',
            transformOrigin: 'top center',
            position: 'relative'
          }}
        >
          <style>
            {generateULLevelCSS(ulLevels)}
          </style>
          <div 
            style={{ 
              ...style.styles.body, 
              padding: '10mm',
              border: '1px dashed #ccc',
              margin: '10mm',
              height: 'calc(297mm - 20mm)',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            {renderMarkdown(parseListDepth(pageContent))}
          </div>
        </div>
      ))}
    </div>
  )
}