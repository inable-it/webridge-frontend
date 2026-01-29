import React, { useEffect, useState } from 'react';

const LS_KEY = 'allowMobileView.v1';

const MobileBlocker = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [allowMobile, setAllowMobile] = useState<boolean>(false);

  useEffect(() => {
    // 모바일 허용 상태 복원
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
    if (saved === 'true') setAllowMobile(true);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 1024;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('주소를 복사하는 데 실패했습니다.');
    }
  };

  const handleContinueOnMobile = () => {
    setAllowMobile(true);
    localStorage.setItem(LS_KEY, 'true');
  };

  const handleReset = () => {
    setAllowMobile(false);
    localStorage.removeItem(LS_KEY);
  };

  if (isMobile === null) return null;

  // 모바일이지만 허용한 경우: 그대로 렌더
  if (isMobile && allowMobile) {
    return (
      <>
        {/* 선택: 상단에 작은 배너로 'PC 권장'만 남길 수도 있음 */}
        <div className='fixed top-0 left-0 right-0 z-[9999] bg-amber-500/90 text-black px-3 py-2 text-xs flex items-center justify-between'>
          <span>PC 환경에 최적화되어 있어요. 일부 UI가 불편할 수 있습니다.</span>
          <button onClick={handleReset} className='underline'>
            다시 안내 보기
          </button>
        </div>
        <div className='pt-10'>{children}</div>
      </>
    );
  }

  if (isMobile) {
    return (
      <div className='fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 px-6 py-12 text-center'>
        <div className='flex items-center justify-center w-24 h-24 mb-8 bg-gray-800 shadow-xl rounded-2xl'>
          <span className='text-5xl'>💻</span>
        </div>

        <h1 className='mb-4 font-bold text-white display-xs'>데스크탑 환경이 필요합니다</h1>

        <div className='space-y-2 text-gray-400 text-md-custom break-keep'>
          <p>본 서비스는 PC 환경에 최적화되어 있습니다.</p>
          <p>아래 주소를 복사해 PC에서 접속해 주세요.</p>
          <p className='mt-2 text-sm text-gray-500'>
            (모바일에서도 볼 수는 있지만 일부 기능/레이아웃이 불편할 수 있어요)
          </p>
        </div>

        <div className='w-full max-w-xs pt-8 mt-10 space-y-3 border-t border-gray-800'>
          {/* Primary: 주소 복사 */}
          <button
            onClick={handleCopyLink}
            className={`w-full py-4 rounded-lg font-semibold transition-all duration-300 ${
              copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {copied ? '복사 완료!' : '🔗 접속 주소 복사하기'}
          </button>

          {/* Secondary: 모바일로 계속 보기 */}
          <button
            onClick={handleContinueOnMobile}
            className='w-full py-4 font-semibold text-gray-100 transition-all duration-300 bg-gray-800 rounded-lg hover:bg-gray-700'
          >
            📱 모바일로 계속 보기
          </button>

          <p className='mt-2 text-gray-500 text-xs-custom'>
            복사한 주소를 나에게 보내기(카카오톡 등)로
            <br />
            PC에서 간편하게 열어보세요.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileBlocker;
