"use client"

import { useEffect, useState } from "react"
import { Check, Palette } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Theme {
  id: string
  name: string
  color: string
}

const themes: Theme[] = [
  { id: "default", name: "라벤더", color: "#8b7aa8" },
  { id: "blue", name: "블루", color: "#3b82f6" },
  { id: "green", name: "그린", color: "#22c55e" },
  { id: "orange", name: "오렌지", color: "#f97316" },
  { id: "pink", name: "핑크", color: "#ec4899" },
  { id: "mono", name: "모노", color: "#525252" },
]

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<string>("default")

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("app-theme")
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  }, [])

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId)
    if (themeId === "default") {
      document.documentElement.removeAttribute("data-theme")
      localStorage.removeItem("app-theme")
    } else {
      document.documentElement.setAttribute("data-theme", themeId)
      localStorage.setItem("app-theme", themeId)
    }
  }

  const currentThemeData = themes.find((t) => t.id === currentTheme) || themes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2">
          <Palette className="h-4 w-4" style={{ color: currentThemeData.color }} />
          <span className="text-xs hidden sm:inline">테마</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleThemeChange(theme.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border"
                style={{ backgroundColor: theme.color }}
              />
              <span className="text-sm">{theme.name}</span>
            </div>
            {currentTheme === theme.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
