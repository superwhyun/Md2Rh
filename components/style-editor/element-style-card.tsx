"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ColorPicker } from "@/components/color-picker"
import { fontCategories, getFontsByCategory } from "@/lib/fonts"
import type { DocumentStyle, NumberingType } from "@/lib/default-styles"
import { headingNumberingOptions } from "@/lib/default-styles"

interface ElementStyleCardProps {
    elementName: string
    elementKey: keyof DocumentStyle["styles"]
    style: any // Using any for the specific style object to facilitate flexibility
    onUpdate: (property: string, value: string) => void
    headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
    currentNumbering?: NumberingType
    onNumberingUpdate?: (type: NumberingType) => void
}

export function ElementStyleCard({
    elementName,
    elementKey,
    style,
    onUpdate,
    headingLevel,
    currentNumbering,
    onNumberingUpdate
}: ElementStyleCardProps) {
    const isTableElement = elementKey === 'th' || elementKey === 'td'



    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{elementName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Label>폰트 패밀리</Label>
                        <Select
                            value={style?.fontFamily || ""}
                            onValueChange={(value) => onUpdate("fontFamily", value)}
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
                            value={style?.fontSize || ""}
                            onChange={(e) => onUpdate("fontSize", e.target.value)}
                            placeholder="16px"
                        />
                    </div>
                    <div>
                        <Label>폰트 굵기</Label>
                        <Input
                            value={style?.fontWeight || ""}
                            onChange={(e) => onUpdate("fontWeight", e.target.value)}
                            placeholder="400"
                        />
                    </div>
                    <div>
                        <Label>텍스트 색상</Label>
                        <ColorPicker
                            value={style?.color || "#000000"}
                            onChange={(color) => onUpdate("color", color)}
                        />
                    </div>
                    <div>
                        <Label>배경 색상</Label>
                        <ColorPicker
                            value={style?.backgroundColor || "#ffffff"}
                            onChange={(color) => onUpdate("backgroundColor", color)}
                        />
                    </div>
                    <div>
                        <Label>여백 (상하)</Label>
                        <Input
                            value={style?.marginTop || ""}
                            onChange={(e) => {
                                onUpdate("marginTop", e.target.value)
                                onUpdate("marginBottom", e.target.value)
                            }}
                            placeholder="16px"
                        />
                    </div>
                    <div>
                        <Label>패딩</Label>
                        <Input
                            value={style?.padding || ""}
                            onChange={(e) => onUpdate("padding", e.target.value)}
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
                                    value={style?.borderWidth || "1px"}
                                    onChange={(e) => onUpdate("borderWidth", e.target.value)}
                                    placeholder="1px"
                                />
                            </div>
                            <div>
                                <Label>테두리 색상</Label>
                                <ColorPicker
                                    value={style?.borderColor || "#ddd"}
                                    onChange={(color) => onUpdate("borderColor", color)}
                                />
                            </div>
                            <div>
                                <Label>좌우 정렬</Label>
                                <Select
                                    value={style?.textAlign || "left"}
                                    onValueChange={(value) => onUpdate("textAlign", value)}
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
                                    value={style?.verticalAlign || "middle"}
                                    onValueChange={(value) => onUpdate("verticalAlign", value)}
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
                                    value={style?.borderStyle || "solid"}
                                    onValueChange={(value) => onUpdate("borderStyle", value)}
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
                {headingLevel && onNumberingUpdate && (
                    <div className="border-t pt-4">
                        <Label>넘버링 형식</Label>
                        <Select
                            value={currentNumbering || 'number'}
                            onValueChange={(value) => onNumberingUpdate(value as NumberingType)}
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
