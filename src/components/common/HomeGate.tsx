import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import HomePage from "@/pages/Homepage";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const hasAnyToken = () => {
  const keys = ["accessToken", "refreshToken", "access_token", "refresh_token"];
  return keys.some((k) => {
    try {
      const v = localStorage.getItem(k)?.trim();
      return !!v && v !== "undefined" && v !== "null";
    } catch {
      return false;
    }
  });
};

/** 루트(/) 접근 시: 토큰 있으면 /dashboard로, 없으면 HomePage 렌더 + 로그아웃 모달(div 기반) */
export default function HomeGate() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((s: RootState) => s.user.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // 1) 토큰 있으면 대시보드로 보냄
  useEffect(() => {
    if (hasAnyToken()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, user]);

  // 2) 로그아웃 후 진입했으면 모달 오픈
  useEffect(() => {
    const viaState = (location.state as any)?.loggedOut === true;
    const viaSession = sessionStorage.getItem("justLoggedOut") === "1";

    if (viaState || viaSession) {
      setShowLogoutModal(true);
      sessionStorage.removeItem("justLoggedOut");

      // 뒤로가기 시 모달 재등장 방지
      if (viaState) {
        navigate(location.pathname, { replace: true, state: null });
      }
    }
  }, [location.state, location.pathname, navigate]);

  const handleClose = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  const handleGoLogin = useCallback(() => {
    setShowLogoutModal(false);
    navigate("/login");
  }, [navigate]);

  return (
    <>
      <HomePage />

      {/* 로그아웃 알림 모달 (div 기반) */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
          aria-describedby="logout-modal-desc"
          onClick={handleClose}
        >
          {/* 모달 카드 */}
          <div
            className="relative w-full max-w-md p-8 text-center bg-white shadow-xl rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={handleClose}
              className="absolute flex items-center justify-center w-10 h-10 text-gray-700 border-2 border-gray-600 rounded-full top-6 right-6 hover:text-gray-900 hover:border-gray-700"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 콘텐츠 */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h2
                  id="logout-modal-title"
                  className="text-[22px] font-extrabold text-gray-900"
                >
                  로그아웃 완료
                </h2>
                <p id="logout-modal-desc" className="text-gray-700">
                  안전하게 로그아웃되었습니다. 다시 이용하시려면 로그인해
                  주세요.
                </p>
              </div>

              <div className="p-4 text-sm text-gray-800 border rounded-xl bg-gray-50">
                계정을 보호하기 위해 공용 기기에서는 반드시 로그아웃을 확인해
                주세요.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  className="h-12 text-base font-semibold rounded-xl"
                >
                  닫기
                </Button>
                <Button
                  onClick={handleGoLogin}
                  className="h-12 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700"
                >
                  로그인하러 가기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
