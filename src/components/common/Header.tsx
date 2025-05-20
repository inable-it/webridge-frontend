import { Bell, CircleUser } from "lucide-react";
import { Button } from "@/components/ui/button";

// 예시용 로그인 상태 (실제에선 context나 store에서 받아야 함)
const isLoggedIn = false;

export const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 border-b bg-gray-50 h-14">
      {/* 좌측 로고 영역 */}
      <div className="flex items-center gap-2">
        <img src="src/assets/icons/logo.svg" alt="logo" className="w-6 h-6" />
        <span className="text-lg font-semibold">WEBridge</span>
      </div>

      {/* 우측 알림 + 로그인/프로필 */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-0 right-0 block w-2 h-2 bg-orange-500 rounded-full"></span>
        </div>

        {/* 로그인 상태에 따라 조건 분기 */}
        {isLoggedIn ? (
          <CircleUser className="w-6 h-6 text-gray-400" />
        ) : (
          <Button variant="outline" className="h-8 px-3 text-sm text-gray-700">
            Login
          </Button>
        )}
      </div>
    </header>
  );
};
