"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DocumentStyle } from "@/lib/default-styles"

interface StyleSelectorProps {
  styles: DocumentStyle[]
  selectedStyleId: string
  onStyleSelect: (styleId: string) => void
}

export function StyleSelector({ styles, selectedStyleId, onStyleSelect }: StyleSelectorProps) {
  const selectedStyle = styles.find((style) => style.id === selectedStyleId)

  return (
    <Select value={selectedStyleId} onValueChange={onStyleSelect}>
      <SelectTrigger className="w-full h-7 text-xs">
        <SelectValue placeholder="서식 선택">{selectedStyle?.name}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {styles.map((style) => (
          <SelectItem key={style.id} value={style.id} className="text-xs">
            {style.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
