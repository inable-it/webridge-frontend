import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const getToken = (k: "accessToken" | "refreshToken") => {
    try {
        const v = localStorage.getItem(k);
        if (!v) return null;
        const s = v.trim();
        return s && s !== "undefined" && s !== "null" ? s : null;
    } catch {
        return null;
    }
};

// RTK Query customBaseQuery와 동일한 스펙을 사용 (/auth/token/refresh/, { refresh })
async function refreshAccessTokenWithFetch(refreshToken: string) {
    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
    const url = `${base}/auth/token/refresh/`;

    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
        throw new Error(`refresh failed: ${res.status}`);
    }
    // customBaseQuery 기준 응답: { access: string }
    return (await res.json()) as { access?: string; refresh?: string };
}

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const [authorized, setAuthorized] = useState<boolean | null>(null); // null: 판단 중

    useEffect(() => {
        let cancelled = false;

        const guard = async () => {
            const accessToken = getToken("accessToken");
            if (accessToken) {
                if (!cancelled) setAuthorized(true);
                return;
            }

            const refreshToken = getToken("refreshToken");
            if (!refreshToken) {
                if (!cancelled) setAuthorized(false);
                return;
            }

            try {
                const resp = await refreshAccessTokenWithFetch(refreshToken);
                const newAccess = resp.access?.trim();

                if (newAccess) {
                    localStorage.setItem("accessToken", newAccess);
                    // 보통 refresh는 그대로 유지. 백엔드가 새 refresh 주면 교체
                    if (resp.refresh?.trim()) {
                        localStorage.setItem("refreshToken", resp.refresh.trim()!);
                    }
                    if (!cancelled) setAuthorized(true);
                } else {
                    if (!cancelled) setAuthorized(false);
                }
            } catch {
                if (!cancelled) setAuthorized(false);
            }
        };

        guard();
        return () => {
            cancelled = true;
        };
    }, [location.key]);

    if (authorized === null) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-600">
                인증 확인 중...
            </div>
        );
    }

    if (!authorized) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};