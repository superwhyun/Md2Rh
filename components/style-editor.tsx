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
import { headingNumberingOptions, olNumberingOptions } from "@/lib/default-styles"
import { ColorPicker } from "@/components/color-picker"
import { fontOptions, fontCategories, getFontsByCategory } from "@/lib/fonts"
import { ArrowLeft, Save, RotateCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getDefaultStyleById } from "@/lib/default-styles"
import { useToast } from "@/hooks/use-toast"

interface StyleEditorProps {
  style: DocumentStyle
  onSave: (style: DocumentStyle) => void
  onCancel: () => void
  onTempUpdate?: (style: DocumentStyle) => void
  onRestore?: (style: DocumentStyle) => void
}

export function StyleEditor({ style, onSave, onCancel, onTempUpdate, onRestore }: StyleEditorProps) {
  const [editedStyle, setEditedStyle] = useState<DocumentStyle>(JSON.parse(JSON.stringify(style)))
  const { toast } = useToast()

  // 스타일이 변경될 때마다 실시간으로 임시 업데이트 전송
  useEffect(() => {
    onTempUpdate?.(editedStyle)
  }, [editedStyle])

  const handleRestore = () => {
    const defaultStyle = getDefaultStyleById(style.id)
    if (defaultStyle && onRestore) {
      const restoredStyle = {
        ...defaultStyle,
        name: editedStyle.name // 사용자가 변경한 이름은 유지
      }
      setEditedStyle(restoredStyle)
      onRestore(restoredStyle)
    }
  }

  const handleSave = () => {
    onSave(editedStyle)
    toast({
      title: "저장 완료",
      description: "서식이 성공적으로 저장되었습니다.",
    })
  }

  const updateElementStyle = (element: keyof DocumentStyle["styles"], property: string, value: string) => {
    console.log(`Updating ${element}.${property} to:`, value)
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
    { marker: '□', fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, markerSpacing: '1em', bottomMargin: '1rem' },
    { marker: 'o', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: '#ffffff', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '▪', fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '▫', fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, markerSpacing: '0.1em', bottomMargin: '1rem' },
    { marker: '‣', fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, markerSpacing: '0.3em', bottomMargin: '1rem' }
  ]

  const getDefaultOLLevels = (): OLLevelStyle[] => [
    { fontSize: '1rem', fontFamily: "'NanumSquare', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '1rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'number' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'korean' },
    { fontSize: '1rem', fontFamily: "'NanumBarunGothic', sans-serif", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'number_paren' },
    { fontSize: '1rem', fontFamily: "'NanumBarunPen', cursive", fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '0rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'korean_paren' },
    { fontSize: '1rem', fontFamily: 'inherit', fontWeight: 'normal', color: 'inherit', backgroundColor: 'transparent', padding: '0', indentation: '3.5rem', boxStyle: false, numberSpacing: '0.3em', bottomMargin: '1rem', numberingType: 'roman' }
  ]




  const renderStyleControls = (elementName: string, elementKey: keyof DocumentStyle["styles"], headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5') => {
    const elementStyle = editedStyle.styles[elementKey] as any
    const isTableElement = elementKey === 'th' || elementKey === 'td'

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
                onChange={(color) => {
                  console.log('Text color changed to:', color)
                  updateElementStyle(elementKey, "color", color)
                }}
              />
            </div>
            <div>
              <Label>배경 색상</Label>
              <ColorPicker
                value={elementStyle?.backgroundColor || "#ffffff"}
                onChange={(color) => {
                  console.log('Background color changed to:', color)
                  updateElementStyle(elementKey, "backgroundColor", color)
                }}
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

          {/* 표 요소(th, td)에 대한 추가 설정 */}
          {isTableElement && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-sm">표 전용 설정</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>테두리 두께</Label>
                  <Input
                    value={elementStyle?.borderWidth || "1px"}
                    onChange={(e) => updateElementStyle(elementKey, "borderWidth", e.target.value)}
                    placeholder="1px"
                  />
                </div>
                <div>
                  <Label>테두리 색상</Label>
                  <ColorPicker
                    value={elementStyle?.borderColor || "#ddd"}
                    onChange={(color) => updateElementStyle(elementKey, "borderColor", color)}
                  />
                </div>
                <div>
                  <Label>좌우 정렬</Label>
                  <Select
                    value={elementStyle?.textAlign || "left"}
                    onValueChange={(value) => updateElementStyle(elementKey, "textAlign", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">왼쪽 정렬</SelectItem>
                      <SelectItem value="center">가운데 정렬</SelectItem>
                      <SelectItem value="right">오른쪽 정렬</SelectItem>
                      <SelectItem value="justify">양쪽 정렬</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>상하 정렬</Label>
                  <Select
                    value={elementStyle?.verticalAlign || "middle"}
                    onValueChange={(value) => updateElementStyle(elementKey, "verticalAlign", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">위쪽 정렬</SelectItem>
                      <SelectItem value="middle">가운데 정렬</SelectItem>
                      <SelectItem value="bottom">아래쪽 정렬</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>테두리 스타일</Label>
                  <Select
                    value={elementStyle?.borderStyle || "solid"}
                    onValueChange={(value) => updateElementStyle(elementKey, "borderStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solid">실선</SelectItem>
                      <SelectItem value="dashed">점선</SelectItem>
                      <SelectItem value="dotted">원점선</SelectItem>
                      <SelectItem value="double">이중선</SelectItem>
                      <SelectItem value="none">없음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

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
                  {headingNumberingOptions.map((option) => (
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={onCancel}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>돌아가기</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleRestore}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>기본값 복원</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>저장</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs defaultValue="headings" className="h-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="headings">제목</TabsTrigger>
          <TabsTrigger value="text">텍스트</TabsTrigger>
          <TabsTrigger value="ul-lists">UL목록</TabsTrigger>
          <TabsTrigger value="ol-lists">OL목록</TabsTrigger>
          <TabsTrigger value="table">표</TabsTrigger>
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
                    <Label>하단 여백</Label>
                    <Input
                      value={level.bottomMargin || '1rem'}
                      onChange={(e) => updateOLLevel(index, 'bottomMargin', e.target.value)}
                      placeholder="1rem"
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
                  <div>
                    <Label>넘버링 형식</Label>
                    <Select
                      value={level.numberingType || 'number'}
                      onValueChange={(value) => updateOLLevel(index, 'numberingType', value as NumberingType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {olNumberingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

        <TabsContent value="table" className="space-y-4 h-full overflow-auto">
          {renderStyleControls("표 (Table)", "table")}
          {renderStyleControls("표 헤더 (TH)", "th")}
          {renderStyleControls("표 셀 (TD)", "td")}
        </TabsContent>

        <TabsContent value="code" className="space-y-4 h-full overflow-auto">
          {renderStyleControls("인라인 코드", "code")}
          {renderStyleControls("코드 블록", "pre")}
        </TabsContent>
      </Tabs>
    </div>
  )
}
