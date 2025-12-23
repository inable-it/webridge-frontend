import { useState, useEffect } from "react";

const MobileBlocker = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const isSmallScreen = window.innerWidth < 1024; // 테블릿 포함 PC 미만 사이즈 차단

            setIsMobile(isMobileDevice || isSmallScreen);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // 초기 로딩 중에는 아무것도 보여주지 않음 (깜빡임 방지)
    if (isMobile === null) return null;

    // 모바일/태블릿 접속 시 보여줄 화면
    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 px-6 py-12 text-center">
                {/* 아이콘 영역 */}
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-800 shadow-xl">
                    <span className="text-5xl">💻</span>
                </div>

                {/* 텍스트 영역: 정의하신 Typography 클래스 사용 */}
                <h1 className="display-xs font-bold text-white mb-4">
                    데스크탑 환경이 필요합니다
                </h1>

                <div className="space-y-2 text-md-custom text-gray-400 break-keep">
                    <p>본 서비스는 정밀한 작업 환경을 위해</p>
                    <p>데스크탑(PC) 브라우저에 최적화되어 있습니다.</p>
                </div>

                {/* 안내선 및 상세 설명 */}
                <div className="mt-10 w-full max-w-xs border-t border-gray-800 pt-8">
                    <p className="text-sm-custom text-gray-500 mb-6">
                        모바일 환경에서는 이용이 제한되는 점 양해 부탁드립니다.
                    </p>

                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    >
                        다시 시도하기
                    </button>
                </div>
            </div>
        );
    }

    // PC 접속 시 서비스(Router) 실행
    return <>{children}</>;
};

export default MobileBlocker;