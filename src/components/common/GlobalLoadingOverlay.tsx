import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";

const API_DELAY_MS = 120;
const API_MIN_SHOW_MS = 600;
const ROUTE_MIN_SHOW_MS = 500;
const ROUTE_DELAY_MS = 0;

export function GlobalLoadingOverlay() {
  const { count, routeActive } = useSelector((s: RootState) => s.loading);
  const apiActive = count > 0;

  // 모드 계산: route 우선 → api → none (표시는 통일, 시간 계산만 다르게 사용)
  type Mode = "route" | "api" | "none";
  const mode: Mode = routeActive ? "route" : apiActive ? "api" : "none";
  const active = mode !== "none";

  const [visible, setVisible] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const delayTimer = useRef<number | null>(null);

  useEffect(() => {
    const delay = mode === "route" ? ROUTE_DELAY_MS : API_DELAY_MS;
    const minShow = mode === "route" ? ROUTE_MIN_SHOW_MS : API_MIN_SHOW_MS;

    const turnOn = () => {
      if (delayTimer.current == null) {
        delayTimer.current = window.setTimeout(() => {
          startedAtRef.current = Date.now();
          setVisible(true);
        }, delay) as unknown as number;
      }
    };

    const turnOff = () => {
      const clearAll = () => {
        if (delayTimer.current) {
          clearTimeout(delayTimer.current);
          delayTimer.current = null;
        }
        startedAtRef.current = null;
        setVisible(false);
      };

      if (startedAtRef.current == null) {
        clearAll();
      } else {
        const elapsed = Date.now() - startedAtRef.current;
        const remain = Math.max(0, minShow - elapsed);
        window.setTimeout(clearAll, remain);
      }
    };

    if (active) turnOn();
    else turnOff();
  }, [active, mode]);

  // 🔁 문구/배경 모두 통일
  const label = "로딩 중…";
  const bgClass = "bg-white/95"; // 통일: 불투명 흰색 (비침 방지)

  return (
    <div
      className={`fixed inset-0 z-[9999] transition-opacity duration-300
      ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }
      ${visible ? "" : "invisible"}`}
      aria-hidden={!visible}
      aria-busy={visible}
      aria-live="polite"
    >
      <div className={`absolute inset-0 ${bgClass}`} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-3 px-5 py-3 shadow-lg rounded-2xl bg-white/90">
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.25"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      </div>
    </div>
  );
}
