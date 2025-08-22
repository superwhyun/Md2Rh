"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">사용법 안내</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900">📝 기본 사용법</h3>
              <p className="mb-3">
                <strong>Md2Rh</strong>는 마크다운을 한국어 문서에 최적화된 형태로 변환하고 프린트할 수 있는 도구입니다.
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>왼쪽 에디터에서 마크다운을 작성하세요</li>
                <li>오른쪽에서 실시간 미리보기를 확인하세요</li>
                <li>상단에서 원하는 문서 스타일을 선택하세요</li>
                <li>&quot;프린트 하기&quot; 버튼으로 깔끔하게 인쇄하세요</li>
              </ol>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900">🎨 스타일 관리</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>문서서식관리자</strong>: 새로운 스타일을 만들거나 기존 스타일을 수정할 수 있습니다</li>
                <li><strong>미리 제공되는 스타일</strong>: 모던, 깔끔한, 정부 보고서 등 다양한 스타일을 제공합니다</li>
                <li><strong>실시간 편집</strong>: 스타일을 수정하면 미리보기가 즉시 반영됩니다</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900">✨ 특별 기능</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>제목 페이지</strong>: 에디터 상단에 제목을 입력하면 별도의 표지 페이지가 생성됩니다</li>
                <li><strong>이미지 업로드</strong>: 드래그앤드롭으로 이미지를 쉽게 삽입할 수 있습니다</li>
                <li><strong>표 크기 조절</strong>: 테이블 헤더에 <code>{"{{20%}}"}</code> 형태로 열 너비를 지정할 수 있습니다</li>
                <li><strong>Callout 박스</strong>: <code>&lt;aside&gt;내용&lt;/aside&gt;</code>로 강조 박스를 만들 수 있습니다</li>
                <li><strong>자동 넘버링</strong>: 제목에 자동으로 번호가 매겨집니다 (스타일별로 다른 형식)</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900">🖨️ 프린트 최적화</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>A4 용지에 최적화된 레이아웃</li>
                <li>프린트 시 불필요한 요소(점선 테두리 등)는 자동으로 제거됩니다</li>
                <li>이미지와 표가 깔끔하게 인쇄됩니다</li>
                <li>제목 페이지가 있으면 자동으로 페이지가 분리됩니다</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-base mb-3 text-gray-900">💡 팁</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>스타일은 로컬 저장소에 자동으로 저장됩니다</li>
                <li>브라우저를 새로고침해도 작성 중인 내용과 스타일이 유지됩니다</li>
                <li>정부 문서나 보고서에는 &quot;정부 보고서 스타일&quot;을 추천합니다</li>
                <li>개인 문서에는 &quot;모던 스타일&quot;이나 &quot;깔끔한 스타일&quot;을 추천합니다</li>
                <li>서식을 최초 디폴트로 돌리려면, 서식관리자에서 삭제하시고 화면을 리로드(F5) 하세요. 기본 서식을 다시 불러옵니다. </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}