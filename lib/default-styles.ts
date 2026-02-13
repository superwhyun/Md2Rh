import type { CSSProperties } from "react"

// Import JSON files directly
import modernStyle from './styles/modern.json'
import classicStyle from './styles/classic.json'
import minimalStyle from './styles/minimal.json'
import cleanStyle from './styles/clean.json'
import korGovStyle from './styles/KorGov.json'

export type NumberingType = 'number' | 'korean' | 'parenthesis' | 'roman' | 'none' | 'korean_paren' | 'number_paren' | 'circle' | 'alpha' | 'alpha_paren' | 'roman_lower'

export const headingNumberingOptions = [
  { label: '숫자 (1., 2., 3.)', value: 'number' as NumberingType },
  { label: '한글 (가., 나., 다.)', value: 'korean' as NumberingType },
  { label: '괄호 (1), 2), 3))', value: 'parenthesis' as NumberingType },
  { label: '로마숫자 (I., II., III.)', value: 'roman' as NumberingType },
  { label: '한글 괄호 ((가), (나), (다))', value: 'korean_paren' as NumberingType },
  { label: '숫자 괄호 ((1), (2), (3))', value: 'number_paren' as NumberingType },
  { label: '없음', value: 'none' as NumberingType },
]

export const olNumberingOptions = [
  ...headingNumberingOptions,
  { label: '원문자 (①, ②, ③)', value: 'circle' as NumberingType },
  { label: '알파벳 (a., b., c.)', value: 'alpha' as NumberingType },
  { label: '알파벳 괄호 ((a), (b), (c))', value: 'alpha_paren' as NumberingType },
  { label: '로마숫자 소문자 (i., ii., iii.)', value: 'roman_lower' as NumberingType },
]

export interface HeadingNumbering {
  h1: NumberingType
  h2: NumberingType
  h3: NumberingType
  h4: NumberingType
  h5: NumberingType
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
  markerSpacing: string
  bottomMargin: string
}

export interface OLLevelStyle {
  fontSize: string
  fontFamily: string
  fontWeight: string
  color: string
  backgroundColor: string
  padding: string
  indentation: string
  boxStyle: boolean
  numberSpacing: string
  bottomMargin: string
  numberingType?: NumberingType
}


export interface ListCustomization {
  ulLevels: ULLevelStyle[]
  olLevels: OLLevelStyle[]
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
    table: CSSProperties
    th: CSSProperties
    td: CSSProperties
  }
}

export function getDefaultStyles(): DocumentStyle[] {
  return [
    modernStyle as DocumentStyle,
    classicStyle as DocumentStyle,
    minimalStyle as DocumentStyle,
    cleanStyle as DocumentStyle,
    korGovStyle as DocumentStyle
  ]
}

export function getDefaultULLevels(): ULLevelStyle[] {
  return [
    { marker: '□', fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, markerSpacing: '1em', bottomMargin: '1rem' },
    { marker: 'o', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: '#ffffff', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '▪', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '▫', fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, markerSpacing: '0.3em', bottomMargin: '1rem' }
  ]
}

export function getDefaultOLLevels(): OLLevelStyle[] {
  return [
    { fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' },
    { fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem' }
  ]
}

export function getDefaultStyleById(id: string): DocumentStyle | undefined {
  const styles = getDefaultStyles()
  return styles.find(style => style.id === id)
}

export function createNewStyle(name: string): DocumentStyle {
  const defaultStyles = getDefaultStyles()
  const baseStyle = defaultStyles[0] || {
    id: Date.now().toString(),
    name: name,
    headingNumbering: {
      h1: 'number',
      h2: 'korean',
      h3: 'parenthesis',
      h4: 'none',
      h5: 'none'
    },
    listCustomization: {
      ulLevels: [
        { marker: '□', fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, markerSpacing: '1em', bottomMargin: '1rem' },
        { marker: 'o', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: '#ffffff', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
        { marker: '▪', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
        { marker: '▫', fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
        { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, markerSpacing: '0.3em', bottomMargin: '1rem' }
      ],
      olLevels: [
        { fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'number' },
        { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'korean' },
        { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'number_paren' },
        { fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'korean_paren' },
        { fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'roman' }
      ],
    },
    styles: {
      body: { fontFamily: "'NanumSquare', sans-serif", fontSize: '16px', lineHeight: '1.6', color: '#333333', backgroundColor: '#ffffff', margin: '0', padding: '20px' },
      h1: { fontSize: '2.5rem', fontWeight: '700', color: '#2c3e50', marginTop: '0', marginBottom: '1.5rem', lineHeight: '1.2' },
      h2: { fontSize: '2rem', fontWeight: '600', color: '#34495e', marginTop: '2rem', marginBottom: '1rem', lineHeight: '1.3' },
      h3: { fontSize: '1.75rem', fontWeight: '600', color: '#34495e', marginTop: '1.5rem', marginBottom: '0.75rem', lineHeight: '1.4' },
      h4: { fontSize: '1.5rem', fontWeight: '600', color: '#34495e', marginTop: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.4' },
      h5: { fontSize: '1.25rem', fontWeight: '600', color: '#34495e', marginTop: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' },
      h6: { fontSize: '1.125rem', fontWeight: '600', color: '#34495e', marginTop: '1rem', marginBottom: '0.5rem', lineHeight: '1.4' },
      p: { marginTop: '0', marginBottom: '1rem', lineHeight: '1.6' },
      blockquote: { margin: '1.5rem 0', padding: '1rem 1.5rem', borderLeft: '4px solid #3498db', backgroundColor: '#ecf0f1', fontStyle: 'italic', color: '#555555' },
      ul: { margin: '1rem 0', paddingLeft: '0' },
      ol: { margin: '1rem 0', paddingLeft: '0' },
      li: { marginBottom: '0.5rem', lineHeight: '1.6' },
      code: { fontFamily: "'Courier New', monospace", fontSize: '0.9rem', backgroundColor: '#f8f9fa', color: '#e74c3c', padding: '0.2rem 0.4rem', borderRadius: '0.25rem' },
      pre: { fontFamily: "'Courier New', monospace", fontSize: '0.9rem', backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', margin: '1.5rem 0' },
      strong: { fontWeight: '700', color: '#2c3e50' },
      em: { fontStyle: 'italic', color: '#7f8c8d' },
      a: { color: '#3498db', textDecoration: 'underline' },
      table: { borderCollapse: 'collapse', width: '100%', margin: '1rem 0', fontFamily: "'NanumSquare', sans-serif", fontSize: '16px' },
      th: { border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', fontWeight: 'bold', textAlign: 'left', verticalAlign: 'middle', fontFamily: "'NanumSquare', sans-serif", fontSize: '16px', color: '#333333', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' },
      td: { border: '1px solid #ddd', padding: '8px', textAlign: 'left', verticalAlign: 'middle', fontFamily: "'NanumSquare', sans-serif", fontSize: '16px', color: '#333333', borderWidth: '1px', borderStyle: 'solid', borderColor: '#ddd' }
    }
  }

  return {
    ...JSON.parse(JSON.stringify(baseStyle)),
    id: Date.now().toString(),
    name: name
  }
}