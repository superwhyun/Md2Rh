"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ColorPicker } from "@/components/color-picker"
import { fontCategories, getFontsByCategory } from "@/lib/fonts"
import type { ULLevelStyle, OLLevelStyle, NumberingType } from "@/lib/default-styles"
import { olNumberingOptions } from "@/lib/default-styles"

interface ListLevelCardProps {
    levelIndex: number
    level: ULLevelStyle | OLLevelStyle
    type: 'ul' | 'ol'
    onUpdate: (field: string, value: string | boolean) => void
}

export function ListLevelCard({ levelIndex, level, type, onUpdate }: ListLevelCardProps) {
    const isUL = type === 'ul'
    // Type assertion for specific access
    const ulLevel = level as ULLevelStyle
    const olLevel = level as OLLevelStyle

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">{type.toUpperCase()} 레벨 {levelIndex + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {isUL ? (
                        <>
                            <div>
                                <Label>마커</Label>
                                <Input
                                    value={ulLevel.marker}
                                    onChange={(e) => onUpdate('marker', e.target.value)}
                                    placeholder="• (예: •, ◦, -, ★, 🔥)"
                                />
                            </div>
                            <div>
                                <Label>마커 간격</Label>
                                <Input
                                    value={ulLevel.markerSpacing || '0.3em'}
                                    onChange={(e) => onUpdate('markerSpacing', e.target.value)}
                                    placeholder="0.3em"
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <Label>숫자 간격</Label>
                                <Input
                                    value={olLevel.numberSpacing || '0.3em'}
                                    onChange={(e) => onUpdate('numberSpacing', e.target.value)}
                                    placeholder="0.3em"
                                />
                            </div>
                            <div>
                                <Label>넘버링 형식</Label>
                                <Select
                                    value={olLevel.numberingType || 'number'}
                                    onValueChange={(value) => onUpdate('numberingType', value as NumberingType)}
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
                        </div>
                    )}

                    <div>
                        <Label>들여쓰기</Label>
                        <Input
                            value={level.indentation}
                            onChange={(e) => onUpdate('indentation', e.target.value)}
                            placeholder="1.5rem"
                        />
                    </div>
                    <div>
                        <Label>하단 여백</Label>
                        <Input
                            value={level.bottomMargin || '1rem'}
                            onChange={(e) => onUpdate('bottomMargin', e.target.value)}
                            placeholder="1rem"
                        />
                    </div>
                    <div>
                        <Label>폰트 크기</Label>
                        <Input
                            value={level.fontSize}
                            onChange={(e) => onUpdate('fontSize', e.target.value)}
                            placeholder="1rem"
                        />
                    </div>
                    <div>
                        <Label>폰트 굵기</Label>
                        <Input
                            value={level.fontWeight}
                            onChange={(e) => onUpdate('fontWeight', e.target.value)}
                            placeholder="normal"
                        />
                    </div>
                    <div>
                        <Label>폰트 패밀리</Label>
                        <Select
                            value={level.fontFamily}
                            onValueChange={(value) => onUpdate('fontFamily', value)}
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
                            onChange={(color) => onUpdate('color', color)}
                        />
                    </div>
                    <div>
                        <Label>배경 색상</Label>
                        <ColorPicker
                            value={level.backgroundColor}
                            onChange={(color) => onUpdate('backgroundColor', color)}
                        />
                    </div>
                    <div>
                        <Label>패딩</Label>
                        <Input
                            value={level.padding}
                            onChange={(e) => onUpdate('padding', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`${type}-boxStyle-${levelIndex}`}
                            checked={level.boxStyle}
                            onCheckedChange={(checked) => onUpdate('boxStyle', Boolean(checked))}
                        />
                        <Label htmlFor={`${type}-boxStyle-${levelIndex}`}>박스 스타일 적용</Label>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
