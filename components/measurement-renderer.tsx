import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import type { DocumentStyle } from '@/lib/default-styles';
import { parseListDepth, extractDepthFromContent, cleanDepthMarkers } from '@/lib/list-depth-parser';

interface MeasurementRendererProps {
  content: string;
  style: DocumentStyle;
}

const A4_WIDTH_MM = 210;
const PAGE_MARGIN_MM = 10; // 10mm padding on each side
const mmToPx = (mm: number) => mm * (96 / 25.4); // Assuming 96 DPI for web display

const MeasurementRenderer = forwardRef<HTMLDivElement, MeasurementRendererProps>(
  ({ content, style }, ref) => {
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
    );

    return (
      <div
        ref={ref}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          height: 'auto',
          width: `${mmToPx(A4_WIDTH_MM - (PAGE_MARGIN_MM * 2))}px`, // Effective content width
          padding: '0',
          margin: '0',
          boxSizing: 'border-box',
          // Apply body styles for accurate measurement
          ...style.styles.body,
        }}
      >
        {renderMarkdown(parseListDepth(content))}
      </div>
    );
  }
);

MeasurementRenderer.displayName = 'MeasurementRenderer';
export default MeasurementRenderer;
