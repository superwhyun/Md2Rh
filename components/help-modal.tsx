"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">사용 안내</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 text-sm">
          <section>
            <h3 className="font-medium text-foreground mb-2">기본 사용법</h3>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-1">
              <li>왼쪽 에디터에서 마크다운을 작성</li>
              <li>오른쪽에서 실시간 미리보기 확인</li>
              <li>상단에서 문서 스타일 선택</li>
              <li>PDF 저장 버튼으로 낵출력</li>
            </ol>
          </section>

          <section>
            <h3 className="font-medium text-foreground mb-2">스타일 관리</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
              <li><span className="text-foreground">스타일 관리자</span>: 새 스타일 생성 및 수정</li>
              <li><span className="text-foreground">기본 제공 스타일</span>: 모던, 깔끔한, 정부 보고서 등</li>
              <li><span className="text-foreground">실시간 편집</span>: 수정 즉시 미리보기 반영</li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium text-foreground mb-2">특별 기능</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
              <li><span className="text-foreground">표지 페이지</span>: &quot;표지&quot; 탭에서 설정</li>
              <li><span className="text-foreground">이미지 삽입</span>: 드래그앤드롭 지원</li>
              <li><span className="text-foreground">표 너비 조절</span>: 헤더에 <code className="bg-muted px-1 rounded">{"{{20%}}"}</code> 형식</li>
              <li><span className="text-foreground">강조 박스</span>: <code className="bg-muted px-1 rounded">&lt;aside&gt;내용&lt;/aside&gt;</code></li>
              <li><span className="text-foreground">자동 넘버링</span>: 제목에 자동 번호 매김</li>
            </ul>
          </section>

          <section>
            <h3 className="font-medium text-foreground mb-2">팁</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-1">
              <li>스타일은 브라우저에 자동 저장됩니다</li>
              <li>기본 서식으로 초기화하려면 서식을 삭제 후 새로고침(F5)</li>
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
