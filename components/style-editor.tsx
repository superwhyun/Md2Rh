"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import type { DocumentStyle, NumberingType, ULLevelStyle, OLLevelStyle } from "@/lib/default-styles"
import { ColorPicker } from "@/components/color-picker"
import { fontOptions, fontCategories, getFontsByCategory } from "@/lib/fonts"

interface StyleEditorProps {
  style: DocumentStyle
  onSave: (style: DocumentStyle) => void
  onCancel: () => void
  onTempUpdate?: (style: DocumentStyle) => void
}

export function StyleEditor({ style, onSave, onCancel, onTempUpdate }: StyleEditorProps) {
  const [editedStyle, setEditedStyle] = useState<DocumentStyle>(JSON.parse(JSON.stringify(style)))

  // 스타일이 변경될 때마다 실시간으로 임시 업데이트 전송
  useEffect(() => {
    onTempUpdate?.(editedStyle)
  }, [editedStyle])

  const updateElementStyle = (element: keyof DocumentStyle["styles"], property: string, value: string) => {
    setEditedStyle((prev) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [element]: {
          ...prev.styles[element],
          [property]: value,
        },
      },
    }))
  }

  const updateStyleName = (name: string) => {
    setEditedStyle((prev) => ({ ...prev, name }))
  }

  const updateHeadingNumbering = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5', type: NumberingType) => {
    setEditedStyle((prev) => ({
      ...prev,
      headingNumbering: {
        h1: prev.headingNumbering?.h1 || 'number',
        h2: prev.headingNumbering?.h2 || 'korean',
        h3: prev.headingNumbering?.h3 || 'parenthesis',
        h4: prev.headingNumbering?.h4 || 'none',
        h5: prev.headingNumbering?.h5 || 'none',
        [level]: type,
      },
    }))
  }


  const updateULLevel = (levelIndex: number, field: keyof ULLevelStyle, value: string | boolean) => {
    setEditedStyle((prev) => {
      const currentLevels = prev.listCustomization?.ulLevels || getDefaultULLevels()
      const newLevels = [...currentLevels]
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        [field]: value,
      }
      
      return {
        ...prev,
        listCustomization: {
          ...prev.listCustomization,
          ulLevels: newLevels,
        },
      }
    })
  }

  const updateOLLevel = (levelIndex: number, field: keyof OLLevelStyle, value: string | boolean) => {
    setEditedStyle((prev) => {
      const currentLevels = prev.listCustomization?.olLevels || getDefaultOLLevels()
      const newLevels = [...currentLevels]
      newLevels[levelIndex] = {
        ...newLevels[levelIndex],
        [field]: value,
      }
      
      return {
        ...prev,
        listCustomization: {
          ...prev.listCustomization,
          olLevels: newLevels,
        },
      }
    })
  }

  const getDefaultULLevels = (): ULLevelStyle[] => [
    { marker: '□', fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, markerSpacing: '1em' },
    { marker: 'o', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: '#ffffff', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em' },
    { marker: '▪', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em' },
    { marker: '▫', fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em' },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, markerSpacing: '0.3em' }
  ]

  const getDefaultOLLevels = (): OLLevelStyle[] => [
    { fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, numberSpacing: '0.3em' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em' },
    { fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em' },
    { fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, numberSpacing: '0.3em' }
  ]

  const numberingOptions = [
    { label: '숫자 (1., 2., 3.)', value: 'number' as NumberingType },
    { label: '한글 (가., 나., 다.)', value: 'korean' as NumberingType },
    { label: '괄호 (1), 2), 3))', value: 'parenthesis' as NumberingType },
    { label: '로마숫자 (I., II., III.)', value: 'roman' as NumberingType },
    { label: '한글 괄호 ((가), (나), (다))', value: 'korean_paren' as NumberingType },
    { label: '숫자 괄호 ((1), (2), (3))', value: 'number_paren' as NumberingType },
    { label: '없음', value: 'none' as NumberingType },
  ]


  const renderStyleControls = (elementName: string, elementKey: keyof DocumentStyle["styles"], headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5') => {
    const elementStyle = editedStyle.styles[elementKey] as any

    return (
      <Card key={elementKey}>
        <CardHeader>
          <CardTitle className="text-base">{elementName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>폰트 패밀리</Label>
              <Select 
                value={elementStyle?.fontFamily || ""} 
                onValueChange={(value) => updateElementStyle(elementKey, "fontFamily", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="폰트를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {fontCategories.map((category) => (
                    <div key={category.value}>
                      <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                        {category.label}
                      </div>
                      {getFontsByCategory(category.value).map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.name}</span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>폰트 크기</Label>
              <Input
                value={elementStyle?.fontSize || ""}
                onChange={(e) => updateElementStyle(elementKey, "fontSize", e.target.value)}
                placeholder="16px"
              />
            </div>
            <div>
              <Label>폰트 굵기</Label>
              <Input
                value={elementStyle?.fontWeight || ""}
                onChange={(e) => updateElementStyle(elementKey, "fontWeight", e.target.value)}
                placeholder="400"
              />
            </div>
            <div>
              <Label>텍스트 색상</Label>
              <ColorPicker
                value={elementStyle?.color || "#000000"}
                onChange={(color) => updateElementStyle(elementKey, "color", color)}
              />
            </div>
            <div>
              <Label>배경 색상</Label>
              <ColorPicker
                value={elementStyle?.backgroundColor || "#ffffff"}
                onChange={(color) => updateElementStyle(elementKey, "backgroundColor", color)}
              />
            </div>
            <div>
              <Label>여백 (상하)</Label>
              <Input
                value={elementStyle?.marginTop || ""}
                onChange={(e) => {
                  updateElementStyle(elementKey, "marginTop", e.target.value)
                  updateElementStyle(elementKey, "marginBottom", e.target.value)
                }}
                placeholder="16px"
              />
            </div>
            <div>
              <Label>패딩</Label>
              <Input
                value={elementStyle?.padding || ""}
                onChange={(e) => updateElementStyle(elementKey, "padding", e.target.value)}
                placeholder="8px"
              />
            </div>
          </div>
          
          {/* 제목 레벨인 경우 넘버링 설정 추가 */}
          {headingLevel && (
            <div className="border-t pt-4">
              <Label>넘버링 형식</Label>
              <Select 
                value={editedStyle.headingNumbering?.[headingLevel] || 'number'} 
                onValueChange={(value) => updateHeadingNumbering(headingLevel, value as NumberingType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {numberingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <div className="flex-1 mr-4">
          <Label>서식 이름</Label>
          <Input value={editedStyle.name} onChange={(e) => updateStyleName(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            돌아가기
          </Button>
          <Button onClick={() => onSave(editedStyle)}>
            저장
          </Button>
        </div>
      </div>

      <Tabs defaultValue="headings" className="h-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="headings">제목</TabsTrigger>
          <TabsTrigger value="text">텍스트</TabsTrigger>
          <TabsTrigger value="ul-lists">UL목록</TabsTrigger>
          <TabsTrigger value="ol-lists">OL목록</TabsTrigger>
          <TabsTrigger value="code">코드</TabsTrigger>
        </TabsList>

        <TabsContent value="headings" className="space-y-4 h-full overflow-auto">
          {/* 제목 스타일 설정 */}
          {renderStyleControls("제목 1 (H1)", "h1", "h1")}
          {renderStyleControls("제목 2 (H2)", "h2", "h2")}
          {renderStyleControls("제목 3 (H3)", "h3", "h3")}
          {renderStyleControls("제목 4 (H4)", "h4", "h4")}
          {renderStyleControls("제목 5 (H5)", "h5", "h5")}
          {renderStyleControls("제목 6 (H6)", "h6")}
        </TabsContent>


        <TabsContent value="text" className="space-y-4 h-full overflow-auto">
          {renderStyleControls("본문 (P)", "p")}
          {renderStyleControls("인용문", "blockquote")}
          {renderStyleControls("강조 (Strong)", "strong")}
          {renderStyleControls("기울임 (Em)", "em")}
          {renderStyleControls("링크 (A)", "a")}
        </TabsContent>

        <TabsContent value="ul-lists" className="space-y-4 h-full overflow-auto">
          {/* UL 레벨별 설정 */}
          {(editedStyle.listCustomization?.ulLevels || getDefaultULLevels()).map((level, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">UL 레벨 {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>마커</Label>
                    <Input
                      value={level.marker}
                      onChange={(e) => updateULLevel(index, 'marker', e.target.value)}
                      placeholder="• (예: •, ◦, -, ★, 🔥)"
                    />
                  </div>
                  <div>
                    <Label>들여쓰기</Label>
                    <Input
                      value={level.indentation}
                      onChange={(e) => updateULLevel(index, 'indentation', e.target.value)}
                      placeholder="1.5rem"
                    />
                  </div>
                  <div>
                    <Label>마커 간격</Label>
                    <Input
                      value={level.markerSpacing || '0.3em'}
                      onChange={(e) => updateULLevel(index, 'markerSpacing', e.target.value)}
                      placeholder="0.3em"
                    />
                  </div>
                  <div>
                    <Label>하단 여백</Label>
                    <Input
                      value={level.bottomMargin || '1rem'}
                      onChange={(e) => updateULLevel(index, 'bottomMargin', e.target.value)}
                      placeholder="1rem"
                    />
                  </div>
                  <div>
                    <Label>폰트 크기</Label>
                    <Input
                      value={level.fontSize}
                      onChange={(e) => updateULLevel(index, 'fontSize', e.target.value)}
                      placeholder="1rem"
                    />
                  </div>
                  <div>
                    <Label>폰트 굵기</Label>
                    <Input
                      value={level.fontWeight}
                      onChange={(e) => updateULLevel(index, 'fontWeight', e.target.value)}
                      placeholder="normal"
                    />
                  </div>
                  <div>
                    <Label>폰트 패밀리</Label>
                    <Select 
                      value={level.fontFamily} 
                      onValueChange={(value) => updateULLevel(index, 'fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="폰트를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">상속</SelectItem>
                        {fontCategories.map((category) => (
                          <div key={category.value}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                              {category.label}
                            </div>
                            {getFontsByCategory(category.value).map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>텍스트 색상</Label>
                    <ColorPicker
                      value={level.color}
                      onChange={(color) => updateULLevel(index, 'color', color)}
                    />
                  </div>
                  <div>
                    <Label>배경 색상</Label>
                    <ColorPicker
                      value={level.backgroundColor}
                      onChange={(color) => updateULLevel(index, 'backgroundColor', color)}
                    />
                  </div>
                  <div>
                    <Label>패딩</Label>
                    <Input
                      value={level.padding}
                      onChange={(e) => updateULLevel(index, 'padding', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`boxStyle-${index}`}
                      checked={level.boxStyle}
                      onCheckedChange={(checked) => updateULLevel(index, 'boxStyle', Boolean(checked))}
                    />
                    <Label htmlFor={`boxStyle-${index}`}>박스 스타일 적용</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ol-lists" className="space-y-4 h-full overflow-auto">
          {/* OL 레벨별 설정 */}
          {(editedStyle.listCustomization?.olLevels || getDefaultOLLevels()).map((level, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">OL 레벨 {index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>숫자 간격</Label>
                    <Input
                      value={level.numberSpacing || '0.3em'}
                      onChange={(e) => updateOLLevel(index, 'numberSpacing', e.target.value)}
                      placeholder="0.3em"
                    />
                  </div>
                  <div>
                    <Label>들여쓰기</Label>
                    <Input
                      value={level.indentation}
                      onChange={(e) => updateOLLevel(index, 'indentation', e.target.value)}
                      placeholder="1.5rem"
                    />
                  </div>
                  <div>
                    <Label>폰트 크기</Label>
                    <Input
                      value={level.fontSize}
                      onChange={(e) => updateOLLevel(index, 'fontSize', e.target.value)}
                      placeholder="1rem"
                    />
                  </div>
                  <div>
                    <Label>폰트 굵기</Label>
                    <Input
                      value={level.fontWeight}
                      onChange={(e) => updateOLLevel(index, 'fontWeight', e.target.value)}
                      placeholder="normal"
                    />
                  </div>
                  <div>
                    <Label>폰트 패밀리</Label>
                    <Select 
                      value={level.fontFamily} 
                      onValueChange={(value) => updateOLLevel(index, 'fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="폰트를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inherit">상속</SelectItem>
                        {fontCategories.map((category) => (
                          <div key={category.value}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                              {category.label}
                            </div>
                            {getFontsByCategory(category.value).map((font) => (
                              <SelectItem key={font.value} value={font.value}>
                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>텍스트 색상</Label>
                    <ColorPicker
                      value={level.color}
                      onChange={(color) => updateOLLevel(index, 'color', color)}
                    />
                  </div>
                  <div>
                    <Label>배경 색상</Label>
                    <ColorPicker
                      value={level.backgroundColor}
                      onChange={(color) => updateOLLevel(index, 'backgroundColor', color)}
                    />
                  </div>
                  <div>
                    <Label>패딩</Label>
                    <Input
                      value={level.padding}
                      onChange={(e) => updateOLLevel(index, 'padding', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`ol-boxStyle-${index}`}
                      checked={level.boxStyle}
                      onCheckedChange={(checked) => updateOLLevel(index, 'boxStyle', Boolean(checked))}
                    />
                    <Label htmlFor={`ol-boxStyle-${index}`}>박스 스타일 적용</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="code" className="space-y-4 h-full overflow-auto">
          {renderStyleControls("인라인 코드", "code")}
          {renderStyleControls("코드 블록", "pre")}
        </TabsContent>
      </Tabs>
    </div>
  )
}
