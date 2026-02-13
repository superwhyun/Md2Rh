"use client"

import { Button } from "@/components/ui/button"
import {
    Bold,
    Italic,
    Link,
    Image,
    List,
    ListOrdered,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Quote,
    Table,
    Undo,
    Redo
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditorToolbarProps {
    onInsert: (prefix: string, suffix?: string, placeholder?: string) => void
    onUndo?: () => void
    onRedo?: () => void
    canUndo?: boolean
    canRedo?: boolean
}

export function EditorToolbar({ 
    onInsert, 
    onUndo, 
    onRedo, 
    canUndo = false, 
    canRedo = false 
}: EditorToolbarProps) {
    return (
        <div className="flex items-center gap-1 px-3 py-2 bg-background border-b overflow-x-auto">
            {/* History Group */}
            <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
                <ToolbarButton
                    onClick={() => onUndo?.()}
                    icon={<Undo className="h-3.5 w-3.5" />}
                    label="실행 취소 (Ctrl+Z)"
                    disabled={!canUndo}
                />
                <ToolbarButton
                    onClick={() => onRedo?.()}
                    icon={<Redo className="h-3.5 w-3.5" />}
                    label="다시 실행 (Ctrl+Y)"
                    disabled={!canRedo}
                />
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Heading Group */}
            <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
                <ToolbarButton
                    onClick={() => onInsert("# ", "")}
                    icon={<Heading1 className="h-3.5 w-3.5" />}
                    label="제목 1"
                />
                <ToolbarButton
                    onClick={() => onInsert("## ", "")}
                    icon={<Heading2 className="h-3.5 w-3.5" />}
                    label="제목 2"
                />
                <ToolbarButton
                    onClick={() => onInsert("### ", "")}
                    icon={<Heading3 className="h-3.5 w-3.5" />}
                    label="제목 3"
                />
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Format Group */}
            <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
                <ToolbarButton
                    onClick={() => onInsert("**", "**", "텍스트")}
                    icon={<Bold className="h-3.5 w-3.5" />}
                    label="굵게"
                />
                <ToolbarButton
                    onClick={() => onInsert("*", "*", "텍스트")}
                    icon={<Italic className="h-3.5 w-3.5" />}
                    label="기울임"
                />
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* List Group */}
            <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
                <ToolbarButton
                    onClick={() => onInsert("- ", "")}
                    icon={<List className="h-3.5 w-3.5" />}
                    label="순서 없는 목록"
                />
                <ToolbarButton
                    onClick={() => onInsert("1. ", "")}
                    icon={<ListOrdered className="h-3.5 w-3.5" />}
                    label="순서 있는 목록"
                />
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Block Group */}
            <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
                <ToolbarButton
                    onClick={() => onInsert("> ", "")}
                    icon={<Quote className="h-3.5 w-3.5" />}
                    label="인용문"
                />
                <ToolbarButton
                    onClick={() => onInsert("```\n", "\n```", "코드")}
                    icon={<Code className="h-3.5 w-3.5" />}
                    label="코드 블록"
                />
                <ToolbarButton
                    onClick={() => onInsert("| 제목 | 제목 |\n| --- | --- |\n| 내용 | 내용 |", "")}
                    icon={<Table className="h-3.5 w-3.5" />}
                    label="표"
                />
            </div>

            <div className="w-px h-5 bg-border mx-1" />

            {/* Insert Group */}
            <div className="flex items-center gap-0.5 bg-muted/40 rounded-md p-0.5">
                <ToolbarButton
                    onClick={() => onInsert("[", "](url)", "링크 텍스트")}
                    icon={<Link className="h-3.5 w-3.5" />}
                    label="링크"
                />
                <ToolbarButton
                    onClick={() => onInsert("![", "](url)", "이미지 설명")}
                    icon={<Image className="h-3.5 w-3.5" />}
                    label="이미지"
                />
            </div>
        </div>
    )
}

interface ToolbarButtonProps {
    onClick: () => void
    icon: React.ReactNode
    label: string
    disabled?: boolean
}

function ToolbarButton({ onClick, icon, label, disabled }: ToolbarButtonProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 px-2 text-muted-foreground hover:text-foreground hover:bg-background disabled:opacity-30" 
                        onClick={onClick}
                        disabled={disabled}
                    >
                        {icon}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{label}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
