"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, RotateCcw } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"
import {
    type DocumentStyle,
    type NumberingType,
    type ULLevelStyle,
    type OLLevelStyle,
    getDefaultStyleById,
    getDefaultULLevels,
    getDefaultOLLevels
} from "@/lib/default-styles"

import { ElementStyleCard } from "./element-style-card"
import { ListLevelCard } from "./list-level-card"

interface StyleEditorProps {
    style: DocumentStyle
    onSave: (style: DocumentStyle) => void
    onCancel: () => void
    onTempUpdate?: (style: DocumentStyle) => void
    onRestore?: (style: DocumentStyle) => void
}

export function StyleEditorMain({ style, onSave, onCancel, onTempUpdate, onRestore }: StyleEditorProps) {
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

    return (
        <div className="space-y-4 h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between flex-shrink-0">
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

            <Tabs defaultValue="headings" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-6 flex-shrink-0">
                    <TabsTrigger value="headings">제목</TabsTrigger>
                    <TabsTrigger value="text">텍스트</TabsTrigger>
                    <TabsTrigger value="ul-lists">UL목록</TabsTrigger>
                    <TabsTrigger value="ol-lists">OL목록</TabsTrigger>
                    <TabsTrigger value="table">표</TabsTrigger>
                    <TabsTrigger value="code">코드</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto mt-2 pr-2">
                    <TabsContent value="headings" className="space-y-4 mt-0">
                        <ElementStyleCard
                            elementName="제목 1 (H1)"
                            elementKey="h1"
                            style={editedStyle.styles.h1}
                            onUpdate={(p, v) => updateElementStyle('h1', p, v)}
                            headingLevel="h1"
                            currentNumbering={editedStyle.headingNumbering?.h1}
                            onNumberingUpdate={(t) => updateHeadingNumbering('h1', t)}
                        />
                        <ElementStyleCard
                            elementName="제목 2 (H2)"
                            elementKey="h2"
                            style={editedStyle.styles.h2}
                            onUpdate={(p, v) => updateElementStyle('h2', p, v)}
                            headingLevel="h2"
                            currentNumbering={editedStyle.headingNumbering?.h2}
                            onNumberingUpdate={(t) => updateHeadingNumbering('h2', t)}
                        />
                        <ElementStyleCard
                            elementName="제목 3 (H3)"
                            elementKey="h3"
                            style={editedStyle.styles.h3}
                            onUpdate={(p, v) => updateElementStyle('h3', p, v)}
                            headingLevel="h3"
                            currentNumbering={editedStyle.headingNumbering?.h3}
                            onNumberingUpdate={(t) => updateHeadingNumbering('h3', t)}
                        />
                        <ElementStyleCard
                            elementName="제목 4 (H4)"
                            elementKey="h4"
                            style={editedStyle.styles.h4}
                            onUpdate={(p, v) => updateElementStyle('h4', p, v)}
                            headingLevel="h4"
                            currentNumbering={editedStyle.headingNumbering?.h4}
                            onNumberingUpdate={(t) => updateHeadingNumbering('h4', t)}
                        />
                        <ElementStyleCard
                            elementName="제목 5 (H5)"
                            elementKey="h5"
                            style={editedStyle.styles.h5}
                            onUpdate={(p, v) => updateElementStyle('h5', p, v)}
                            headingLevel="h5"
                            currentNumbering={editedStyle.headingNumbering?.h5}
                            onNumberingUpdate={(t) => updateHeadingNumbering('h5', t)}
                        />
                        <ElementStyleCard
                            elementName="제목 6 (H6)"
                            elementKey="h6"
                            style={editedStyle.styles.h6}
                            onUpdate={(p, v) => updateElementStyle('h6', p, v)}
                        />
                    </TabsContent>

                    <TabsContent value="text" className="space-y-4 mt-0">
                        <ElementStyleCard
                            elementName="본문 (P)"
                            elementKey="p"
                            style={editedStyle.styles.p}
                            onUpdate={(p, v) => updateElementStyle('p', p, v)}
                        />
                        <ElementStyleCard
                            elementName="인용문"
                            elementKey="blockquote"
                            style={editedStyle.styles.blockquote}
                            onUpdate={(p, v) => updateElementStyle('blockquote', p, v)}
                        />
                        <ElementStyleCard
                            elementName="강조 (Strong)"
                            elementKey="strong"
                            style={editedStyle.styles.strong}
                            onUpdate={(p, v) => updateElementStyle('strong', p, v)}
                        />
                        <ElementStyleCard
                            elementName="기울임 (Em)"
                            elementKey="em"
                            style={editedStyle.styles.em}
                            onUpdate={(p, v) => updateElementStyle('em', p, v)}
                        />
                        <ElementStyleCard
                            elementName="링크 (A)"
                            elementKey="a"
                            style={editedStyle.styles.a}
                            onUpdate={(p, v) => updateElementStyle('a', p, v)}
                        />
                    </TabsContent>

                    <TabsContent value="ul-lists" className="space-y-4 mt-0">
                        {(editedStyle.listCustomization?.ulLevels || getDefaultULLevels()).map((level, index) => (
                            <ListLevelCard
                                key={index}
                                levelIndex={index}
                                level={level}
                                type="ul"
                                onUpdate={(field, value) => updateULLevel(index, field as keyof ULLevelStyle, value)}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="ol-lists" className="space-y-4 mt-0">
                        {(editedStyle.listCustomization?.olLevels || getDefaultOLLevels()).map((level, index) => (
                            <ListLevelCard
                                key={index}
                                levelIndex={index}
                                level={level}
                                type="ol"
                                onUpdate={(field, value) => updateOLLevel(index, field as keyof OLLevelStyle, value)}
                            />
                        ))}
                    </TabsContent>

                    <TabsContent value="table" className="space-y-4 mt-0">
                        <ElementStyleCard
                            elementName="표 (Table)"
                            elementKey="table"
                            style={editedStyle.styles.table}
                            onUpdate={(p, v) => updateElementStyle('table', p, v)}
                        />
                        <ElementStyleCard
                            elementName="표 헤더 (TH)"
                            elementKey="th"
                            style={editedStyle.styles.th}
                            onUpdate={(p, v) => updateElementStyle('th', p, v)}
                        />
                        <ElementStyleCard
                            elementName="표 셀 (TD)"
                            elementKey="td"
                            style={editedStyle.styles.td}
                            onUpdate={(p, v) => updateElementStyle('td', p, v)}
                        />
                    </TabsContent>

                    <TabsContent value="code" className="space-y-4 mt-0">
                        <ElementStyleCard
                            elementName="인라인 코드"
                            elementKey="code"
                            style={editedStyle.styles.code}
                            onUpdate={(p, v) => updateElementStyle('code', p, v)}
                        />
                        <ElementStyleCard
                            elementName="코드 블록"
                            elementKey="pre"
                            style={editedStyle.styles.pre}
                            onUpdate={(p, v) => updateElementStyle('pre', p, v)}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    )
}
