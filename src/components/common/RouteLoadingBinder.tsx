import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigation } from "react-router-dom";
import { start, stop, setRouteActive } from "@/features/store/loadingSlice";

export function RouteLoadingBinder() {
  const nav = useNavigation();
  const { pathname, search } = useLocation();
  const dispatch = useDispatch();

  // 1) Data Router의 실제 전환 상태 (정확)
  useEffect(() => {
    const busy = nav.state === "loading" || nav.state === "submitting";
    // 라우트 전환 시작/종료 플래그
    dispatch(setRouteActive(busy));
    // 전역 로딩도 즉시 ON/OFF (라우트는 지연 없이)
    if (busy) dispatch(start());
    else dispatch(stop());
  }, [nav.state, dispatch]);

  // 2) 로더/코드스플리팅이 없어 nav가 idle로만 지나갈 때의 최소 힌트 (선택)
  useEffect(() => {
    // 라우트 전환 ‘힌트’도 좀 더 길게 (예: 500ms)
    dispatch(setRouteActive(true));
    dispatch(start());
    const t = window.setTimeout(() => {
      dispatch(stop());
      dispatch(setRouteActive(false));
    }, 500); // ← 220 → 500ms 로 늘림
    return () => clearTimeout(t);
  }, [pathname, search, dispatch]);

  return null;
}
