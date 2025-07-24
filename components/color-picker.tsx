"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

// 색상 변환 유틸리티 함수들
function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number) {
  h /= 360
  s /= 100
  l /= 100

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedBaseColor, setSelectedBaseColor] = useState("#ff0000")
  const [lightness, setLightness] = useState(50)

  // value가 변경될 때 상태 업데이트
  useEffect(() => {
    if (value && value.startsWith('#') && value.length === 7) {
      try {
        const [h, s, l] = hexToHsl(value)
        setSelectedBaseColor(hslToHex(h, s, 50)) // 기본 밝기 50%로 베이스 색상 설정
        setLightness(l)
      } catch (error) {
        console.error('Invalid color format:', value)
      }
    }
  }, [value])

  // 슬라이더 값이 변경될 때 색상 업데이트
  const handleLightnessChange = (newLightness: number[]) => {
    const [h, s] = hexToHsl(selectedBaseColor)
    const newColor = hslToHex(h, s, newLightness[0])
    setLightness(newLightness[0])
    onChange(newColor)
  }

  // 베이스 색상이 선택될 때
  const handleBaseColorSelect = (color: string) => {
    // 직접 preset 색상을 사용
    setSelectedBaseColor(color)
    onChange(color)
    
    // lightness 값도 해당 색상의 밝기로 업데이트
    try {
      const [h, s, l] = hexToHsl(color)
      setLightness(l)
    } catch (error) {
      console.error('Error parsing color:', color)
    }
  }

  const presetColors = [
    "#000000",
    "#ffffff", 
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
    "#ffa500",
    "#800080",
    "#008000",
    "#ffc0cb",
    "#a52a2a",
    "#808080",
    "#000080",
  ]

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent" type="button">
          <div className="w-4 h-4 rounded border mr-2" style={{ backgroundColor: value || "#000000" }} />
          {value || "#000000"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-4">
          <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
          
          <div>
            <div className="text-sm font-medium mb-2">색상 선택</div>
            <div className="grid grid-cols-5 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded border-2 hover:scale-110 transition-all ${
                    selectedBaseColor === color ? 'border-primary ring-2 ring-primary/30' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleBaseColorSelect(color)}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">밝기 조절</div>
            <div className="px-1">
              <Slider
                value={[lightness]}
                onValueChange={handleLightnessChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>어둡게</span>
                <span>{lightness}%</span>
                <span>밝게</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">미리보기:</div>
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ backgroundColor: value || "#000000" }}
            />
            <span className="text-sm text-muted-foreground">{value || "#000000"}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
