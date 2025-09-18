import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import HomePage from "@/pages/Homepage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

/** 루트(/) 접근 시: 토큰 있으면 /dashboard로, 없으면 HomePage 렌더 + 로그아웃 모달 */
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
    // A. navigate("/", { state: { loggedOut: true } }) 로 온 경우
    const viaState = (location.state as any)?.loggedOut === true;
    // B. sessionStorage 플래그를 이용한 경우 (새로고침 등 대비)
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

  return (
    <>
      <HomePage />

      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그아웃 완료</DialogTitle>
            <DialogDescription>
              안전하게 로그아웃되었습니다. 다시 이용하시려면 로그인해 주세요.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowLogoutModal(false)}
            >
              닫기
            </Button>
            <Button
              onClick={() => {
                setShowLogoutModal(false);
                navigate("/login");
              }}
            >
              로그인하러 가기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
