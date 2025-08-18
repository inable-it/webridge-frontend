import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { usePdfGenerator } from "@/hooks/usePdfGenerator";

const recentItems = [
  "https://wkdaofjsd9.com",
  "https://wkdaofjsd9.com",
  "https://wkdaofjsd9.com",
];

const resultItems = [
  { id: 1, name: "적절한 대체 텍스트 제공", score: "23/50", type: "오류 확인" },
  { id: 2, name: "자막 제공", score: "Cell Text", type: "오류 확인" },
  { id: 3, name: "표의 구성", score: "Cell Text", type: "오류 확인" },
  { id: 4, name: "자동 재생 금지", score: "이슈 내용", type: "오류 확인" },
  { id: 5, name: "텍스트 콘텐츠의 명도 대비", score: "Cell Text", type: "오류 확인",},
  { id: 6, name: "키보드 사용 보장", score: "Cell Text", type: "오류 확인" },
  { id: 7, name: "레이블 제공", score: "Cell Text", type: "오류 확인" },
  { id: 8, name: "응답 시간 조절", score: "Cell Text", type: "오류 확인" },
  { id: 9, name: "정지 기능 제공", score: "이슈 내용", type: "오류 확인" },
  { id: 10, name: "깜빡임과 번쩍임 사용 제한", score: "Cell Text", type: "오류 확인",},
  { id: 11, name: "제목 제공", score: "Cell Text", type: "오류 확인" },
  { id: 12, name: "기본 언어 표시", score: "Cell Text", type: "오류 확인" },
  { id: 13, name: "마크업 오류 방지", score: "Cell Text", type: "오류 확인" },
];

const DashboardPage = () => {
  const { generatePdf } = usePdfGenerator(); // Hook 사용

  return (
      <div className="flex h-screen bg-[#ecf3ff] p-8 gap-5">
        {/* 왼쪽: 최근 검사 + 최근 검사 내역 */}
        <div className="flex w-[320px] space-y-6 rounded-lg flex-col">
          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg">
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">접근성 검사</h2>
              <div className="flex items-center gap-2">
                <Input placeholder="https://" className="flex-1" />
                <Button variant="outline" size="icon">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="w-[320px] bg-[#f4f8ff] border-2 p-6 space-y-6 rounded-lg h-full">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">최근 검사 내역</p>
              <div className="space-y-1">
                {recentItems.map((url, idx) => (
                    <Button
                        key={idx}
                        variant="outline"
                        className="justify-between w-full"
                    >
                      <span className="text-sm truncate">{url}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Button>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* 오른쪽: 검사 결과 */}
        <div className="flex-1 p-8 bg-white border-2 rounded-lg shadow-md">
          {/* PDF 저장 버튼 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold">
                WEBridge 웹 접근성 검사 요약 보고서
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                홈페이지명 : ooo <br />
                https://www.naver.com/
              </p>
              <p className="mt-1 text-xs text-gray-400">
                2025.06.25 / 한국형 웹 콘텐츠 접근성 지침 2.2 기준
              </p>
            </div>

            <Button
                onClick={() => generatePdf("reportContent", "accessibility-report.pdf")}
            >
              PDF로 저장하기
            </Button>
          </div>

          {/* PDF 대상 영역 */}
          <div
              className="p-6 bg-white border rounded-lg"
              id="reportContent" // PDF 변환 대상 ID
          >
            <table className="w-full text-sm text-center">
              <thead>
              <tr className="border-b">
                <th className="p-2">순번</th>
                <th className="p-2">항목</th>
                <th className="p-2">준수율</th>
                <th className="p-2">오류 확인</th>
              </tr>
              </thead>
              <tbody>
              {resultItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.id}</td>
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.score}</td>
                    <td className="p-2">
                      <Button
                          size="sm"
                          variant="outline"
                          className="bg-[#6C9AFF] text-white"
                      >
                        {item.type}
                      </Button>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default DashboardPage;