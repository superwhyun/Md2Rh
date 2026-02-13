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
        <div className="flex items-center gap-0.5 px-2 py-1.5 bg-muted/30 overflow-x-auto">
            <ToolbarButton
                onClick={() => onUndo?.()}
                icon={<Undo className="h-4 w-4" />}
                label="실행 취소 (Ctrl+Z)"
                disabled={!canUndo}
            />
            <ToolbarButton
                onClick={() => onRedo?.()}
                icon={<Redo className="h-4 w-4" />}
                label="다시 실행 (Ctrl+Y)"
                disabled={!canRedo}
            />
            <div className="w-px h-4 bg-border mx-1" />
            <ToolbarButton
                onClick={() => onInsert("# ", "")}
                icon={<Heading1 className="h-4 w-4" />}
                label="제목 1"
            />
            <ToolbarButton
                onClick={() => onInsert("## ", "")}
                icon={<Heading2 className="h-4 w-4" />}
                label="제목 2"
            />
            <ToolbarButton
                onClick={() => onInsert("### ", "")}
                icon={<Heading3 className="h-4 w-4" />}
                label="제목 3"
            />
            <div className="w-px h-4 bg-border mx-1" />
            <ToolbarButton
                onClick={() => onInsert("**", "**", "텍스트")}
                icon={<Bold className="h-4 w-4" />}
                label="굵게"
            />
            <ToolbarButton
                onClick={() => onInsert("*", "*", "텍스트")}
                icon={<Italic className="h-4 w-4" />}
                label="기울임"
            />
            <div className="w-px h-4 bg-border mx-1" />
            <ToolbarButton
                onClick={() => onInsert("- ", "")}
                icon={<List className="h-4 w-4" />}
                label="순서 없는 목록"
            />
            <ToolbarButton
                onClick={() => onInsert("1. ", "")}
                icon={<ListOrdered className="h-4 w-4" />}
                label="순서 있는 목록"
            />
            <div className="w-px h-4 bg-border mx-1" />
            <ToolbarButton
                onClick={() => onInsert("> ", "")}
                icon={<Quote className="h-4 w-4" />}
                label="인용문"
            />
            <ToolbarButton
                onClick={() => onInsert("```\n", "\n```", "코드")}
                icon={<Code className="h-4 w-4" />}
                label="코드 블록"
            />
            <ToolbarButton
                onClick={() => onInsert("| 제목 | 제목 |\n| --- | --- |\n| 내용 | 내용 |", "")}
                icon={<Table className="h-4 w-4" />}
                label="표"
            />
            <div className="w-px h-4 bg-border mx-1" />
            <ToolbarButton
                onClick={() => onInsert("[", "](url)", "링크 텍스트")}
                icon={<Link className="h-4 w-4" />}
                label="링크"
            />
            <ToolbarButton
                onClick={() => onInsert("![", "](url)", "이미지 설명")}
                icon={<Image className="h-4 w-4" />}
                label="이미지"
            />
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
                        size="icon" 
                        className="h-8 w-8" 
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
