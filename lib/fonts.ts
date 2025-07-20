export interface FontOption {
  name: string
  value: string
  category: 'system' | 'serif' | 'sans-serif' | 'monospace' | 'google' | 'naver'
}

export const fontOptions: FontOption[] = [
  // 시스템 폰트
  { name: '시스템 기본', value: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', category: 'system' },
  { name: 'Apple SD Gothic Neo', value: "'Apple SD Gothic Neo', sans-serif", category: 'system' },
  { name: '맑은 고딕', value: "'Malgun Gothic', sans-serif", category: 'system' },
  { name: '나눔고딕', value: "'Nanum Gothic', sans-serif", category: 'system' },
  
  // Sans-serif 폰트
  { name: 'Inter', value: "'Inter', sans-serif", category: 'sans-serif' },
  { name: 'Helvetica Neue', value: "'Helvetica Neue', Arial, sans-serif", category: 'sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif', category: 'sans-serif' },
  { name: 'Roboto', value: "'Roboto', sans-serif", category: 'sans-serif' },
  { name: 'Open Sans', value: "'Open Sans', sans-serif", category: 'sans-serif' },
  
  // Serif 폰트
  { name: 'Times New Roman', value: "'Times New Roman', serif", category: 'serif' },
  { name: 'Georgia', value: 'Georgia, serif', category: 'serif' },
  { name: 'Playfair Display', value: "'Playfair Display', serif", category: 'serif' },
  { name: 'Merriweather', value: "'Merriweather', serif", category: 'serif' },
  { name: 'Noto Serif KR', value: "'Noto Serif KR', serif", category: 'serif' },
  
  // Monospace 폰트
  { name: 'Fira Code', value: "'Fira Code', monospace", category: 'monospace' },
  { name: 'Monaco', value: 'Monaco, monospace', category: 'monospace' },
  { name: 'Courier New', value: "'Courier New', monospace", category: 'monospace' },
  { name: 'SF Mono', value: "'SF Mono', Monaco, monospace", category: 'monospace' },
  { name: 'JetBrains Mono', value: "'JetBrains Mono', monospace", category: 'monospace' },
  
  // Google Fonts (인기 한글 폰트)
  { name: 'Noto Sans KR', value: "'Noto Sans KR', sans-serif", category: 'google' },
  { name: '나눔명조', value: "'Nanum Myeongjo', serif", category: 'google' },
  { name: '나눔펜스크립트', value: "'Nanum Pen Script', cursive", category: 'google' },
  { name: 'IBM Plex Sans KR', value: "'IBM Plex Sans KR', sans-serif", category: 'google' },
  { name: 'Sunflower', value: "'Sunflower', sans-serif", category: 'google' },

  // 네이버 웹 폰트
  { name: '나눔스퀘어', value: "'NanumSquare', sans-serif", category: 'naver' },
  { name: '나눔스퀘어라운드', value: "'NanumSquareRound', sans-serif", category: 'naver' },
  { name: '나눔바른고딕', value: "'NanumBarunGothic', sans-serif", category: 'naver' },
  { name: '나눔바른펜', value: "'NanumBarunPen', cursive", category: 'naver' },
  { name: '나눔고딕에코', value: "'NanumGothicEco', sans-serif", category: 'naver' },
  { name: '나눔명조에코', value: "'NanumMyeongjoEco', serif", category: 'naver' },
  { name: '나눔브러시스크립트', value: "'NanumBrushScript', cursive", category: 'naver' },
  { name: '마루부리', value: "'MaruBuri', sans-serif", category: 'naver' },
]

export const fontCategories = [
  { label: '시스템 폰트', value: 'system' },
  { label: 'Sans-serif', value: 'sans-serif' },
  { label: 'Serif', value: 'serif' },
  { label: 'Monospace', value: 'monospace' },
  { label: 'Google Fonts', value: 'google' },
  { label: '네이버 웹폰트', value: 'naver' },
]

export function getFontsByCategory(category: string): FontOption[] {
  return fontOptions.filter(font => font.category === category)
}

export function getFontByValue(value: string): FontOption | undefined {
  return fontOptions.find(font => font.value === value)
}