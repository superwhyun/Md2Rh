"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Globe } from "lucide-react"

interface LinkPreview {
  title: string
  description: string
  image: string
  siteName: string
  url: string
}

interface LinkCardProps {
  url: string
}

export function LinkCard({ url }: LinkCardProps) {
  const [preview, setPreview] = useState<LinkPreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true)
        setError(false)
        
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
        const data = await response.json()
        
        if (response.ok) {
          setPreview(data)
        } else {
          setError(true)
          // 기본 정보라도 표시
          setPreview({
            title: url,
            description: '',
            image: '',
            siteName: new URL(url).hostname,
            url
          })
        }
      } catch (err) {
        setError(true)
        setPreview({
          title: url,
          description: '',
          image: '',
          siteName: new URL(url).hostname,
          url
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPreview()
  }, [url])

  if (loading) {
    return (
      <Card className="w-full mb-4 animate-pulse border border-gray-200">
        <CardContent className="p-3">
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preview) return null

  return (
    <Card className="w-full mb-4 hover:shadow-md transition-shadow cursor-pointer group border border-gray-200">
      <CardContent className="p-0">
        <a 
          href={preview.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block link-card"
        >
          <div className="flex gap-3 p-3">
            {/* 이미지 */}
            <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
              {preview.image ? (
                <img 
                  src={preview.image} 
                  alt={preview.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const parent = target.parentElement
                    if (parent) {
                      parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>'
                    }
                  }}
                />
              ) : (
                <Globe className="w-8 h-8 text-gray-400" />
              )}
            </div>

            {/* 콘텐츠 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {preview.title}
                  </h3>
                  {preview.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {preview.description}
                    </p>
                  )}
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{preview.siteName}</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}