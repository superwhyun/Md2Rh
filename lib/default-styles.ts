import type { CSSProperties } from "react"

export type NumberingType = 'number' | 'korean' | 'parenthesis' | 'roman' | 'none'

export interface HeadingNumbering {
  h1: NumberingType
  h2: NumberingType
  h3: NumberingType
}

export interface ULLevelStyle {
  marker: string
  fontSize: string
  fontFamily: string
  fontWeight: string
  color: string
  backgroundColor: string
  padding: string
  indentation: string
  boxStyle: boolean
  includeChildrenInBox: boolean
  markerSpacing: string
}

export interface ListCustomization {
  ulLevels: ULLevelStyle[]
  olMarker: string
}

export interface DocumentStyle {
  id: string
  name: string
  headingNumbering: HeadingNumbering
  listCustomization: ListCustomization
  styles: {
    body: CSSProperties
    h1: CSSProperties
    h2: CSSProperties
    h3: CSSProperties
    h4: CSSProperties
    h5: CSSProperties
    h6: CSSProperties
    p: CSSProperties
    blockquote: CSSProperties
    ul: CSSProperties
    ol: CSSProperties
    li: CSSProperties
    code: CSSProperties
    pre: CSSProperties
    strong: CSSProperties
    em: CSSProperties
    a: CSSProperties
  }
}

export function getDefaultStyles(): DocumentStyle[] {
  return [
    {
      id: "modern",
      name: "모던 스타일",
      headingNumbering: {
        h1: 'number',
        h2: 'korean',
        h3: 'parenthesis'
      },
      listCustomization: {
        ulLevels: [
          { marker: '•', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1.5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '◦', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '▪', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '4.5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '▫', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '6rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '7.5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' }
        ],
        olMarker: ''
      },
      styles: {
        body: {
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          lineHeight: "1.6",
          color: "#1a1a1a",
          backgroundColor: "#ffffff",
        },
        h1: {
          fontSize: "2.5rem",
          fontWeight: "700",
          color: "#1a1a1a",
          marginTop: "2rem",
          marginBottom: "1rem",
          lineHeight: "1.2",
        },
        h2: {
          fontSize: "2rem",
          fontWeight: "600",
          color: "#2d2d2d",
          marginTop: "1.5rem",
          marginBottom: "0.75rem",
          lineHeight: "1.3",
        },
        h3: {
          fontSize: "1.5rem",
          fontWeight: "600",
          color: "#404040",
          marginTop: "1.25rem",
          marginBottom: "0.5rem",
          lineHeight: "1.4",
        },
        h4: {
          fontSize: "1.25rem",
          fontWeight: "500",
          color: "#525252",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        h5: {
          fontSize: "1.125rem",
          fontWeight: "500",
          color: "#525252",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        h6: {
          fontSize: "1rem",
          fontWeight: "500",
          color: "#525252",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        p: {
          fontSize: "1rem",
          lineHeight: "1.7",
          marginBottom: "1rem",
          color: "#374151",
        },
        blockquote: {
          borderLeft: "4px solid #e5e7eb",
          paddingLeft: "1rem",
          margin: "1.5rem 0",
          fontStyle: "italic",
          color: "#6b7280",
          backgroundColor: "#f9fafb",
          padding: "1rem",
        },
        ul: {
          marginBottom: "1rem",
          paddingLeft: "1.5rem",
        },
        ol: {},
        li: {},
        code: {
          backgroundColor: "#f3f4f6",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.25rem",
          fontSize: "0.875rem",
          fontFamily: "'Fira Code', 'Monaco', monospace",
          color: "#dc2626",
        },
        pre: {
          backgroundColor: "#1f2937",
          color: "#f9fafb",
          padding: "1rem",
          borderRadius: "0.5rem",
          marginBottom: "1rem",
          overflow: "auto",
        },
        strong: {
          fontWeight: "700",
          color: "#1a1a1a",
        },
        em: {
          fontStyle: "italic",
          color: "#4b5563",
        },
        a: {
          color: "#3b82f6",
          textDecoration: "underline",
          textDecorationColor: "#93c5fd",
        },
      },
    },
    {
      id: "classic",
      name: "클래식 스타일",
      headingNumbering: {
        h1: 'roman',
        h2: 'number',
        h3: 'korean'
      },
      listCustomization: {
        ulLevels: [
          { marker: '◦', fontSize: '1.125rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '2rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '▪', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '4rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '•', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '6rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '-', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '8rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '+', fontSize: '0.875rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '10rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' }
        ],
        olMarker: ''
      },
      styles: {
        body: {
          fontFamily: "'Times New Roman', serif",
          lineHeight: "1.8",
          color: "#2c2c2c",
          backgroundColor: "#fefefe",
        },
        h1: {
          fontSize: "2.25rem",
          fontWeight: "bold",
          color: "#1a1a1a",
          marginTop: "2rem",
          marginBottom: "1rem",
          textAlign: "center",
          borderBottom: "2px solid #d1d5db",
          paddingBottom: "0.5rem",
        },
        h2: {
          fontSize: "1.875rem",
          fontWeight: "bold",
          color: "#2d2d2d",
          marginTop: "1.5rem",
          marginBottom: "0.75rem",
        },
        h3: {
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#404040",
          marginTop: "1.25rem",
          marginBottom: "0.5rem",
        },
        h4: {
          fontSize: "1.25rem",
          fontWeight: "bold",
          color: "#525252",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        h5: {
          fontSize: "1.125rem",
          fontWeight: "bold",
          color: "#525252",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        h6: {
          fontSize: "1rem",
          fontWeight: "bold",
          color: "#525252",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        p: {
          fontSize: "1.125rem",
          lineHeight: "1.8",
          marginBottom: "1.25rem",
          textAlign: "justify",
          textIndent: "1.5rem",
        },
        blockquote: {
          borderLeft: "3px solid #9ca3af",
          paddingLeft: "1.5rem",
          margin: "2rem 0",
          fontStyle: "italic",
          fontSize: "1.125rem",
          color: "#4b5563",
        },
        ul: {
          marginBottom: "1.25rem",
          paddingLeft: "2rem",
        },
        ol: {},
        li: {},
        code: {
          backgroundColor: "#f5f5f5",
          padding: "0.25rem 0.5rem",
          borderRadius: "0.125rem",
          fontSize: "0.9rem",
          fontFamily: "'Courier New', monospace",
          border: "1px solid #d1d5db",
        },
        pre: {
          backgroundColor: "#f8f9fa",
          padding: "1.5rem",
          border: "1px solid #e5e7eb",
          borderRadius: "0.25rem",
          marginBottom: "1.5rem",
          overflow: "auto",
        },
        strong: {
          fontWeight: "bold",
        },
        em: {
          fontStyle: "italic",
        },
        a: {
          color: "#1d4ed8",
          textDecoration: "underline",
        },
      },
    },
    {
      id: "minimal",
      name: "미니멀 스타일",
      headingNumbering: {
        h1: 'number',
        h2: 'number',
        h3: 'number'
      },
      listCustomization: {
        ulLevels: [
          { marker: '-', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '+', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '2rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '*', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '◦', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '4rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
          { marker: '▪', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' }
        ],
        olMarker: ''
      },
      styles: {
        body: {
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
          lineHeight: "1.6",
          color: "#333333",
          backgroundColor: "#ffffff",
          maxWidth: "800px",
          margin: "0 auto",
        },
        h1: {
          fontSize: "2rem",
          fontWeight: "300",
          color: "#000000",
          marginTop: "3rem",
          marginBottom: "1.5rem",
          letterSpacing: "-0.025em",
        },
        h2: {
          fontSize: "1.5rem",
          fontWeight: "300",
          color: "#000000",
          marginTop: "2rem",
          marginBottom: "1rem",
          letterSpacing: "-0.025em",
        },
        h3: {
          fontSize: "1.25rem",
          fontWeight: "400",
          color: "#000000",
          marginTop: "1.5rem",
          marginBottom: "0.75rem",
        },
        h4: {
          fontSize: "1.125rem",
          fontWeight: "400",
          color: "#000000",
          marginTop: "1.25rem",
          marginBottom: "0.5rem",
        },
        h5: {
          fontSize: "1rem",
          fontWeight: "500",
          color: "#000000",
          marginTop: "1rem",
          marginBottom: "0.5rem",
        },
        h6: {
          fontSize: "0.875rem",
          fontWeight: "500",
          color: "#000000",
          marginTop: "1rem",
          marginBottom: "0.5rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
        p: {
          fontSize: "1rem",
          lineHeight: "1.7",
          marginBottom: "1.5rem",
          color: "#333333",
        },
        blockquote: {
          borderLeft: "2px solid #000000",
          paddingLeft: "1rem",
          margin: "2rem 0",
          fontStyle: "normal",
          color: "#666666",
        },
        ul: {
          marginBottom: "1.5rem",
          paddingLeft: "1rem",
          listStyle: "none",
        },
        ol: {},
        li: {},
        code: {
          backgroundColor: "#f5f5f5",
          padding: "0.125rem 0.25rem",
          fontSize: "0.875rem",
          fontFamily: "'SF Mono', Monaco, monospace",
        },
        pre: {
          backgroundColor: "#f8f8f8",
          padding: "1rem",
          marginBottom: "1.5rem",
          overflow: "auto",
          fontSize: "0.875rem",
        },
        strong: {
          fontWeight: "600",
        },
        em: {
          fontStyle: "italic",
        },
        a: {
          color: "#000000",
          textDecoration: "underline",
          textDecorationThickness: "1px",
          textUnderlineOffset: "2px",
        },
      },
    },
  ]
}

export function createNewStyle(name: string): DocumentStyle {
  return {
    id: Date.now().toString(),
    name,
    headingNumbering: {
      h1: 'number',
      h2: 'korean',
      h3: 'parenthesis'
    },
    listCustomization: {
      ulLevels: [
        { marker: '•', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1.5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
        { marker: '◦', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
        { marker: '▪', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '4.5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
        { marker: '▫', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '6rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' },
        { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '7.5rem', boxStyle: false, includeChildrenInBox: false, markerSpacing: '0.3em' }
      ],
      olMarker: ''
    },
    styles: {
      body: {
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.6",
        color: "#000000",
        backgroundColor: "#ffffff",
      },
      h1: {
        fontSize: "2rem",
        fontWeight: "bold",
        marginTop: "1.5rem",
        marginBottom: "1rem",
      },
      h2: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        marginTop: "1.25rem",
        marginBottom: "0.75rem",
      },
      h3: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        marginTop: "1rem",
        marginBottom: "0.5rem",
      },
      h4: {
        fontSize: "1.125rem",
        fontWeight: "bold",
        marginTop: "1rem",
        marginBottom: "0.5rem",
      },
      h5: {
        fontSize: "1rem",
        fontWeight: "bold",
        marginTop: "1rem",
        marginBottom: "0.5rem",
      },
      h6: {
        fontSize: "0.875rem",
        fontWeight: "bold",
        marginTop: "1rem",
        marginBottom: "0.5rem",
      },
      p: {
        fontSize: "1rem",
        lineHeight: "1.6",
        marginBottom: "1rem",
      },
      blockquote: {
        borderLeft: "4px solid #ccc",
        paddingLeft: "1rem",
        margin: "1rem 0",
        fontStyle: "italic",
      },
      ul: {
        marginBottom: "1rem",
        paddingLeft: "1.5rem",
      },
      ol: {},
      li: {},
      code: {
        backgroundColor: "#f4f4f4",
        padding: "0.25rem",
        borderRadius: "0.25rem",
        fontSize: "0.875rem",
        fontFamily: "monospace",
      },
      pre: {
        backgroundColor: "#f4f4f4",
        padding: "1rem",
        borderRadius: "0.25rem",
        marginBottom: "1rem",
        overflow: "auto",
      },
      strong: {
        fontWeight: "bold",
      },
      em: {
        fontStyle: "italic",
      },
      a: {
        color: "#0066cc",
        textDecoration: "underline",
      },
    },
  }
}
