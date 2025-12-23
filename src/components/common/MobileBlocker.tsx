import { useState, useEffect } from "react";

const MobileBlocker = ({ children }: { children: React.ReactNode }) => {
    const [isMobile, setIsMobile] = useState<boolean | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const isSmallScreen = window.innerWidth < 1024;
            setIsMobile(isMobileDevice || isSmallScreen);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // 주소 복사 함수
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            // 2초 후 복사 완료 메시지 초기화
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            alert("주소를 복사하는 데 실패했습니다.");
        }
    };

    if (isMobile === null) return null;

    if (isMobile) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 px-6 py-12 text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-gray-800 shadow-xl">
                    <span className="text-5xl">💻</span>
                </div>

                <h1 className="display-xs font-bold text-white mb-4">
                    데스크탑 환경이 필요합니다
                </h1>

                <div className="space-y-2 text-md-custom text-gray-400 break-keep">
                    <p>본 서비스는 PC 환경에 최적화되어 있습니다.</p>
                    <p>아래 주소를 복사하여 PC에서 접속해 주세요.</p>
                </div>

                <div className="mt-10 w-full max-w-xs border-t border-gray-800 pt-8">
                    {/* 주소 복사 버튼 */}
                    <button
                        onClick={handleCopyLink}
                        className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
                            copied
                                ? "bg-green-600 text-white"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                    >
                        {copied ? "✅ 복사 완료!" : "🔗 접속 주소 복사하기"}
                    </button>

                    <p className="mt-4 text-xs-custom text-gray-500">
                        복사한 주소를 나에게 보내기(카카오톡 등)를 통해<br/>PC에서 간편하게 열어보세요.
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default MobileBlocker;