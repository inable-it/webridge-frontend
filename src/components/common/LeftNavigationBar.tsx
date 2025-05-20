import {
  LayoutDashboard,
  Lock,
  FileText,
  Monitor,
  Settings,
  Download,
  HelpCircle,
  Search,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// 메인 메뉴 항목
const menuItems = [
  { icon: LayoutDashboard, label: "내 사이트" },
  { icon: Lock, label: "접근성 검사" },
  { icon: FileText, label: "리포트 생성" },
  { icon: Monitor, label: "모니터링" },
  { icon: Settings, label: "권한관리" },
];

// 고객지원 메뉴 항목
const supportItems = [
  { icon: Download, label: "서비스 설치" },
  { icon: HelpCircle, label: "자주 묻는 질문" },
];

export const LNB = () => {
  return (
    <div className="flex flex-col justify-between h-full p-4">
      {/* 상단 영역: 검색창 + 메뉴 */}
      <div className="space-y-6">
        {/* 🔍 검색창 */}
        <div className="flex items-center px-3 py-2 border rounded-lg bg-gray-50">
          <Search className="w-8 h-8 mr-1 text-gray-500" />
          <input
            type="text"
            placeholder="Search for..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-gray-500"
          />
          <button className="p-1 ml-2 bg-white border rounded-md">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 주요 메뉴 섹션 */}
        <div>
          <p className="mb-2 text-xs text-gray-500">메뉴</p>
          <div className="space-y-1">
            {menuItems.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="justify-between w-full text-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
                <span>›</span>
              </Button>
            ))}
          </div>
        </div>

        {/* 고객지원 섹션 */}
        <div>
          <p className="mb-2 text-xs text-gray-500">고객지원</p>
          <div className="space-y-1">
            {supportItems.map(({ icon: Icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="justify-between w-full text-sm"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {label}
                </div>
                <span>›</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* 플랜 업그레이드 안내 박스 */}
      <div className="p-4 text-center bg-gray-100 rounded-lg">
        <p className="mb-1 text-sm font-semibold">Plus Plan 사용하기</p>
        <p className="mb-3 text-xs text-gray-500">
          Plus Plan으로 업그레이드 후 다양한 혜택 제공 내용
        </p>
        <Button className="w-full text-sm">업그레이드</Button>
      </div>
    </div>
  );
};
