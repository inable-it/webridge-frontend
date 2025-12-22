import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigation } from "react-router-dom";
import { setRouteActive } from "@/features/store/loadingSlice";

export function RouteLoadingBinder() {
  const nav = useNavigation();
  const { pathname, search } = useLocation();
  const dispatch = useDispatch();

  // 타이머는 routeActive만 컨트롤 (count 건드리지 않음)
  const hintTimerRef = useRef<number | null>(null);

  // 1) Data Router의 실제 전환 상태 (정확)
  useEffect(() => {
    const busy = nav.state === "loading" || nav.state === "submitting";
    dispatch(setRouteActive(busy));

    // busy면 힌트 타이머 취소 (실제 상태가 우선)
    if (busy && hintTimerRef.current) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  }, [nav.state, dispatch]);

  // 2) nav.state가 idle로만 지나가는 케이스용 "힌트" (선택)
  useEffect(() => {
    // 기존 타이머 제거
    if (hintTimerRef.current) {
      window.clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }

    // 짧게 routeActive 켰다가 끄기 (count는 절대 건드리지 않음)
    dispatch(setRouteActive(true));
    hintTimerRef.current = window.setTimeout(() => {
      dispatch(setRouteActive(false));
      hintTimerRef.current = null;
    }, 500) as unknown as number;

    return () => {
      if (hintTimerRef.current) {
        window.clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [pathname, search, dispatch]);

  return null;
}
