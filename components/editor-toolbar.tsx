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
    Table
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EditorToolbarProps {
    onInsert: (prefix: string, suffix?: string, placeholder?: string) => void
}

export function EditorToolbar({ onInsert }: EditorToolbarProps) {
    return (
        <div className="flex items-center gap-1 p-1 px-2 border-b bg-background overflow-x-auto sticky top-0 z-10 mx-2 mt-2 border rounded-md shadow-sm">
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

function ToolbarButton({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClick}>
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
