"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import {
  type DocumentStyle,
  type ULLevelStyle,
  type OLLevelStyle,
  getDefaultULLevels,
  getDefaultOLLevels,
} from "@/lib/default-styles"
import { cleanDepthMarkers } from "@/lib/list-depth-parser"
import { LinkCard } from "@/components/link-card"

interface PaginatedPreviewProps {
  content: string
  style: DocumentStyle
  isPrinting?: boolean
}

type ListContextValue = {
  type: "ul" | "ol"
  depth: number
} | null

const ListContext = React.createContext<ListContextValue>(null)

type ContentPart =
  | { type: "markdown"; content: string }
  | { type: "linkCard"; content: string }
  | { type: "blobImage"; alt: string; src: string }

const clampIndex = (index: number, max: number) => {
  if (!Number.isFinite(index) || max <= 0) return 0
  return Math.max(0, Math.min(index, max - 1))
}

const normalizeULLevels = (levels: ULLevelStyle[]) =>
  levels.map((level) => ({
    ...level,
    marker: level.marker || "•",
    markerSpacing: level.markerSpacing || "0.3em",
    bottomMargin: level.bottomMargin || "0.75rem",
  }))

const normalizeOLLevels = (levels: OLLevelStyle[]) =>
  levels.map((level) => ({
    ...level,
    numberSpacing: level.numberSpacing || "0.3em",
    bottomMargin: level.bottomMargin || "0.75rem",
  }))

const cleanDepthMarkersDeep = (children: React.ReactNode): React.ReactNode =>
  React.Children.map(children, (child) => {
    if (typeof child === "string") return cleanDepthMarkers(child)
    if (!React.isValidElement(child)) return child

    const childProps = child.props as { children?: React.ReactNode }
    if (!("children" in childProps)) return child

    return React.cloneElement(child as React.ReactElement<any>, {
      ...childProps,
      children: cleanDepthMarkersDeep(childProps.children),
    } as any)
  })

const DEBUG_SHOW_DEPTH_MARKERS = false
const DEBUG_SHOW_LIST_META = false

const getDepthFromOwnMarker = (children: React.ReactNode, type: "ul" | "ol"): number | null => {
  const pattern = type === "ul" ? /\[UL_DEPTH_(\d+)\]/ : /\[OL_DEPTH_(\d+)\]/
  const nodes = React.Children.toArray(children)

  for (const node of nodes) {
    if (typeof node === "string") {
      const match = node.match(pattern)
      if (match) return parseInt(match[1], 10)
      continue
    }

    if (React.isValidElement(node)) {
      const tag = typeof node.type === "string" ? node.type : ""
      if (tag === "ul" || tag === "ol") break

      const markerDepth = getDepthFromOwnMarker((node.props as any)?.children, type)
      if (markerDepth !== null) return markerDepth
    }
  }

  return null
}

const splitContentParts = (text: string): ContentPart[] => {
  const linkCardRegex = /\[LINK_CARD:(https?:\/\/[^\]]+)\]/g
  const blobImageRegex = /!\[([^\]]*)\]\((blob:[^)]+)\)/g

  const allMatches: Array<
    | { type: "linkCard"; index: number; length: number; content: string }
    | { type: "blobImage"; index: number; length: number; alt: string; src: string }
  > = []

  let match: RegExpExecArray | null

  while ((match = linkCardRegex.exec(text)) !== null) {
    allMatches.push({
      type: "linkCard",
      index: match.index,
      length: match[0].length,
      content: match[1],
    })
  }

  while ((match = blobImageRegex.exec(text)) !== null) {
    allMatches.push({
      type: "blobImage",
      index: match.index,
      length: match[0].length,
      alt: match[1],
      src: match[2],
    })
  }

  allMatches.sort((a, b) => a.index - b.index)

  const parts: ContentPart[] = []
  let lastIndex = 0

  for (const item of allMatches) {
    if (item.index > lastIndex) {
      const before = text.slice(lastIndex, item.index)
      if (before) parts.push({ type: "markdown", content: before })
    }

    if (item.type === "linkCard") {
      parts.push({ type: "linkCard", content: item.content })
    } else {
      parts.push({ type: "blobImage", alt: item.alt, src: item.src })
    }

    lastIndex = item.index + item.length
  }

  if (lastIndex < text.length) {
    const after = text.slice(lastIndex)
    if (after) parts.push({ type: "markdown", content: after })
  }

  return parts.length > 0 ? parts : [{ type: "markdown", content: text }]
}

const extractWidthToken = (text: string) => {
  const match = text.match(/\{\{(\d+(?:\.\d+)?%)\}\}/)
  if (!match) return { width: "auto", clean: text }

  const percentage = parseFloat(match[1].replace("%", ""))
  const width = percentage > 0 && percentage <= 100 ? match[1] : "auto"
  const clean = text.replace(/\{\{(\d+(?:\.\d+)?%)\}\}/, "").trim()

  return { width, clean }
}

export function PaginatedPreview({ content, style, isPrinting = false }: PaginatedPreviewProps) {
  const tableWidthsRef = React.useRef<string[]>([])
  const columnIndexRef = React.useRef<number>(0)
  const bodyFontFamily = style.styles.body.fontFamily || style.styles.p.fontFamily || style.styles.li.fontFamily
  const resolveLevelFontFamily = (fontFamily: string | undefined) =>
    fontFamily && fontFamily !== "inherit" ? fontFamily : bodyFontFamily

  const ulLevels = React.useMemo(
    () => normalizeULLevels(style.listCustomization?.ulLevels || getDefaultULLevels()),
    [style.listCustomization?.ulLevels]
  )

  const olLevels = React.useMemo(
    () => normalizeOLLevels(style.listCustomization?.olLevels || getDefaultOLLevels()),
    [style.listCustomization?.olLevels]
  )

  const ListUl = ({ children }: { children: React.ReactNode }) => {
    const parent = React.useContext(ListContext)
    const depth = parent ? parent.depth + 1 : 0
    const isNested = Boolean(parent)

    return (
      <ListContext.Provider value={{ type: "ul", depth }}>
        <ul
          style={{
            ...style.styles.ul,
            listStyle: "none",
            margin: isNested ? "0.25em 0 0 0" : "0 0 0.5rem 0",
            padding: 0,
            // 컨테이너는 기준 폰트로 리셋하고, 실제 레벨 폰트는 li에서만 적용
            fontSize: style.styles.body.fontSize,
            fontFamily: bodyFontFamily,
            fontWeight: style.styles.body.fontWeight,
            color: style.styles.body.color,
          }}
        >
          {children}
        </ul>
      </ListContext.Provider>
    )
  }

  const ListOl = ({ children }: { children: React.ReactNode }) => {
    const parent = React.useContext(ListContext)
    const depth = parent ? parent.depth + 1 : 0
    const isNested = Boolean(parent)
    const indexedChildren = React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child
      return React.cloneElement(child as React.ReactElement<any>, { olIndex: index + 1 } as any)
    })

    return (
      <ListContext.Provider value={{ type: "ol", depth }}>
        <ol
          style={{
            ...style.styles.ol,
            listStyle: "none",
            margin: isNested ? "0.25em 0 0 0" : "0 0 0.5rem 0",
            padding: 0,
            // 컨테이너는 기준 폰트로 리셋하고, 실제 레벨 폰트는 li에서만 적용
            fontSize: style.styles.body.fontSize,
            fontFamily: bodyFontFamily,
            fontWeight: style.styles.body.fontWeight,
            color: style.styles.body.color,
          }}
        >
          {indexedChildren}
        </ol>
      </ListContext.Provider>
    )
  }

  const ListLi = ({ children, olIndex }: { children: React.ReactNode; olIndex?: number }) => {
    const list = React.useContext(ListContext)
    const isOrdered = list?.type === "ol"
    const markerDepth = getDepthFromOwnMarker(children, isOrdered ? "ol" : "ul")
    const depth = markerDepth ?? (list?.depth ?? 0)

    if (isOrdered) {
      const level = olLevels[clampIndex(depth, olLevels.length)]
      const numberText = `${olIndex ?? 1}.`
      const markerCh = Math.max(2, String(olIndex ?? 1).length + 1)
      return (
        <li
          style={{
            ...style.styles.li,
            display: "flex",
            alignItems: "flex-start",
            gap: level.numberSpacing,
            marginLeft: level.indentation,
            marginBottom: level.bottomMargin,
            paddingTop: level.padding !== "0" ? level.padding : undefined,
            paddingBottom: level.padding !== "0" ? level.padding : undefined,
            paddingRight: level.padding !== "0" ? level.padding : undefined,
            fontSize: level.fontSize,
            fontFamily: resolveLevelFontFamily(level.fontFamily),
            fontWeight: level.fontWeight,
            color: level.color === "inherit" ? style.styles.li.color : level.color,
            backgroundColor:
              level.backgroundColor === "transparent" ? style.styles.li.backgroundColor : level.backgroundColor,
            listStyle: "none",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              minWidth: `${markerCh}ch`,
              fontFamily: resolveLevelFontFamily(level.fontFamily),
              fontSize: level.fontSize,
              fontWeight: level.fontWeight,
              color: level.color === "inherit" ? undefined : level.color,
              lineHeight: style.styles.li.lineHeight || style.styles.p.lineHeight || style.styles.body.lineHeight,
            }}
          >
            {numberText}
          </span>
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontFamily: resolveLevelFontFamily(level.fontFamily),
              fontSize: level.fontSize,
              fontWeight: level.fontWeight,
              color: level.color === "inherit" ? undefined : level.color,
              lineHeight: style.styles.li.lineHeight || style.styles.p.lineHeight || style.styles.body.lineHeight,
            }}
          >
            {DEBUG_SHOW_DEPTH_MARKERS ? children : cleanDepthMarkersDeep(children)}
          </div>
        </li>
      )
    }

    const level = ulLevels[clampIndex(depth, ulLevels.length)]
    const markerUnit = Math.max(1.2, level.marker.length * 0.8)
    return (
      <li
        style={{
          ...style.styles.li,
          display: "flex",
          alignItems: "flex-start",
          gap: level.markerSpacing,
          marginLeft: level.indentation,
          marginBottom: level.bottomMargin,
          paddingTop: level.padding !== "0" ? level.padding : undefined,
          paddingBottom: level.padding !== "0" ? level.padding : undefined,
          paddingRight: level.padding !== "0" ? level.padding : undefined,
          fontSize: level.fontSize,
          fontFamily: resolveLevelFontFamily(level.fontFamily),
          fontWeight: level.fontWeight,
          color: level.color === "inherit" ? style.styles.li.color : level.color,
          backgroundColor:
            level.backgroundColor === "transparent" ? style.styles.li.backgroundColor : level.backgroundColor,
          listStyle: "none",
          textIndent: undefined,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            minWidth: `${markerUnit}em`,
            fontFamily: resolveLevelFontFamily(level.fontFamily),
            fontSize: level.fontSize,
            fontWeight: level.fontWeight,
            color: level.color === "inherit" ? undefined : level.color,
            lineHeight: style.styles.li.lineHeight || style.styles.p.lineHeight || style.styles.body.lineHeight,
          }}
        >
          {level.marker}
        </span>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: resolveLevelFontFamily(level.fontFamily),
            fontSize: level.fontSize,
            fontWeight: level.fontWeight,
            color: level.color === "inherit" ? undefined : level.color,
            lineHeight: style.styles.li.lineHeight || style.styles.p.lineHeight || style.styles.body.lineHeight,
          }}
        >
          {DEBUG_SHOW_DEPTH_MARKERS ? children : cleanDepthMarkersDeep(children)}
        </div>
      </li>
    )
  }

  const ListAwareParagraph = ({ children }: { children: React.ReactNode }) => {
    const list = React.useContext(ListContext)
    if (!list) return <p style={style.styles.p}>{children}</p>

    return (
      <p
        style={{
          margin: 0,
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          fontStyle: "inherit",
          lineHeight: "inherit",
          color: "inherit",
          letterSpacing: "inherit",
        }}
      >
        {children}
      </p>
    )
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", marginBottom: isPrinting ? "0" : "40px" }}>
      <div style={isPrinting ? { width: "210mm", overflow: "visible" } : { width: "157.5mm", overflow: "hidden" }}>
        <div
          className="bg-white"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: 0,
            boxSizing: "border-box",
            boxShadow: isPrinting
              ? "none"
              : "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            ...(isPrinting
              ? {}
              : {
                  transform: "scale(0.75)",
                  transformOrigin: "top left",
                  position: "relative",
                }),
          }}
        >
          <div
            style={{
              ...style.styles.body,
              padding: "1.5mm",
              margin: "12mm",
              minHeight: "calc(297mm - 24mm)",
              boxSizing: "border-box",
              overflow: "visible",
            }}
          >
            {splitContentParts(content).map((part, index) => {
              if (part.type === "linkCard") {
                return <LinkCard key={index} url={part.content} />
              }

              if (part.type === "blobImage") {
                return (
                  <img
                    key={index}
                    src={part.src}
                    alt={part.alt || ""}
                    style={{ maxWidth: "80%", height: "auto", margin: "1rem auto", display: "block" }}
                  />
                )
              }

              return (
                <ReactMarkdown
                  key={index}
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    h1: ({ children }) => <h1 style={style.styles.h1}>{children}</h1>,
                    h2: ({ children }) => <h2 style={style.styles.h2}>{children}</h2>,
                    h3: ({ children }) => <h3 style={style.styles.h3}>{children}</h3>,
                    h4: ({ children }) => <h4 style={style.styles.h4}>{children}</h4>,
                    h5: ({ children }) => <h5 style={style.styles.h5}>{children}</h5>,
                    h6: ({ children }) => <h6 style={style.styles.h6}>{children}</h6>,
                    p: ({ children }) => <ListAwareParagraph>{children}</ListAwareParagraph>,
                    blockquote: ({ children }) => <blockquote style={style.styles.blockquote}>{children}</blockquote>,
                    ul: ({ children }) => <ListUl>{children}</ListUl>,
                    ol: ({ children }) => <ListOl>{children}</ListOl>,
                    li: ({ children }) => <ListLi>{children}</ListLi>,
                    table: ({ children }) => {
                      tableWidthsRef.current = []
                      columnIndexRef.current = 0
                      return <table style={{ ...style.styles.table, tableLayout: "fixed" }}>{children}</table>
                    },
                    thead: ({ children }) => <thead>{children}</thead>,
                    tbody: ({ children }) => <tbody>{children}</tbody>,
                    tr: ({ children }) => {
                      columnIndexRef.current = 0
                      return <tr>{children}</tr>
                    },
                    th: ({ children }) => {
                      const childrenText = React.Children.toArray(children)
                        .map((child) => {
                          if (typeof child === "string") return child
                          if (typeof child === "number") return child.toString()
                          if (React.isValidElement(child)) return (child.props as any)?.children || ""
                          return ""
                        })
                        .join("")

                      const { width, clean } = extractWidthToken(childrenText)
                      tableWidthsRef.current.push(width)

                      const thStyle: React.CSSProperties = {
                        border: "1px solid #ddd",
                        padding: "8px",
                        backgroundColor: "#f2f2f2",
                        fontWeight: "bold",
                        textAlign: "left",
                        verticalAlign: "middle",
                        ...(style.styles.th as React.CSSProperties),
                      }

                      if (width !== "auto") {
                        thStyle.width = width
                        thStyle.minWidth = "50px"
                      }

                      return <th style={thStyle}>{clean || children}</th>
                    },
                    td: ({ children }) => {
                      const tdStyle: React.CSSProperties = {
                        border: "1px solid #ddd",
                        padding: "8px",
                        textAlign: "left",
                        verticalAlign: "middle",
                        ...(style.styles.td as React.CSSProperties),
                      }

                      const width =
                        tableWidthsRef.current.length > 0 && columnIndexRef.current < tableWidthsRef.current.length
                          ? tableWidthsRef.current[columnIndexRef.current]
                          : "auto"

                      if (width !== "auto") {
                        tdStyle.width = width
                        tdStyle.minWidth = "50px"
                      }

                      columnIndexRef.current++
                      return <td style={tdStyle}>{children}</td>
                    },
                    code: ({ children, ...props }) => (
                      <code style={style.styles.code} {...props}>
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <div style={style.styles.pre}>
                        <pre style={{ margin: 0, fontFamily: style.styles.pre.fontFamily || "monospace", whiteSpace: "pre-wrap" }}>
                          {children}
                        </pre>
                      </div>
                    ),
                    strong: ({ children }) => <strong style={style.styles.strong}>{children}</strong>,
                    em: ({ children }) => <em style={style.styles.em}>{children}</em>,
                    a: ({ children, href }) => (
                      <a href={href} style={style.styles.a}>
                        {children}
                      </a>
                    ),
                    img: ({ src, alt, title }) => (
                      <img
                        src={src}
                        alt={alt || ""}
                        title={title || alt || ""}
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        style={{ maxWidth: "80%", height: "auto", margin: "1rem auto", display: "block" }}
                      />
                    ),
                  }}
                >
                  {part.content}
                </ReactMarkdown>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
