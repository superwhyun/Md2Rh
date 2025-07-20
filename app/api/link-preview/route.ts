import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    // URL 유효성 검사
    new URL(url)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // 1시간 캐시
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // 메타데이터 추출
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  $('title').text() || 
                  url

    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       ''

    let image = $('meta[property="og:image"]').attr('content') || 
                $('meta[name="twitter:image"]').attr('content') || 
                ''

    // 상대 경로를 절대 경로로 변환
    if (image && !image.startsWith('http')) {
      const baseUrl = new URL(url)
      image = new URL(image, baseUrl.origin).href
    }

    const siteName = $('meta[property="og:site_name"]').attr('content') || 
                     new URL(url).hostname

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      siteName,
      url
    })

  } catch (error) {
    console.error('Link preview error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch link preview',
      title: url,
      description: '',
      image: '',
      siteName: new URL(url).hostname,
      url
    }, { status: 500 })
  }
}