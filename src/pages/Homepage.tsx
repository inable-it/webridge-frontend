import { useNavigate } from 'react-router-dom';
import { FadeInSection } from '@/components/common/FadeInSection';
import ArrowRightIcon from '@/assets/icons/ArrowRightIcon.svg';
import { useEffect, useRef, useState } from 'react';
import { STYLES } from '@/constants/homepage.ts';

interface ActionButtonProps {
  onClick: () => void;
  variant: 'primary' | 'secondary';
  children: React.ReactNode;
  icon?: string;
}
interface FeatureTextProps {
  title: string;
  description: string;
}

// 메인 컴포넌트들
const MainTitle = () => (
  <h1 className={STYLES.text.title}>
    좋은 웹의 기본값,
    <br />웹 접근성부터 점검하세요
  </h1>
);

const SubTitle = () => (
  <p className={STYLES.text.subtitle}>
    마크업, 명도 대비, 키보드 사용성, 대체 텍스트까지 — 좋은 UX를 만드는 기본 요소를 한 번에 확인하세요.
  </p>
);

const ActionButton = ({ onClick, variant, children, icon }: ActionButtonProps) => (
  <button onClick={onClick} className={`${STYLES.button.base} ${STYLES.button[variant]}`}>
    <span className={STYLES.text.button}>{children}</span>
    {icon && <img src={icon} alt='접근성 검사하기 페이지로 가는 화살표' className='w-6 h-6' />}
  </button>
);

const ActionButtons = () => {
  const navigate = useNavigate();
  return (
    <div className='flex flex-wrap items-center justify-center gap-4 mt-8 md:gap-6'>
      <ActionButton onClick={() => navigate('/dashboard')} variant='primary' icon={ArrowRightIcon}>
        접근성 검사하기
      </ActionButton>
      <ActionButton onClick={() => navigate('/accessibility')} variant='secondary'>
        웹 접근성 솔루션이란?
      </ActionButton>
    </div>
  );
};

// 리포트 관련 컴포넌트들
const ReportLogo = () => (
  <div className='relative w-10 h-10 overflow-hidden bg-white border border-gray-200 rounded-lg'>
    <div className='absolute w-3 h-3 rounded-full left-1 top-3 bg-sky-300' />
    <div className='absolute left-2.5 top-3 w-3 h-3 rounded-full bg-blue-400' />
    <div className='absolute w-3 h-3 rounded-full left-6 top-3 bg-gradient-to-r from-cyan-300 to-blue-700' />
  </div>
);

const ReportHeader = () => (
  <div className='flex h-14 w-full items-center border-b border-gray-200 bg-white px-5 py-3.5'>
    <div className='flex items-center gap-3'>
      <ReportLogo />
      <span className="font-['Pretendard_Variable'] text-xl font-bold text-gray-900">WEBridge</span>
    </div>
  </div>
);

const URLInput = () => (
  <div className='w-full max-w-sm'>
    <div className='relative p-3 bg-white border-2 border-blue-600 rounded-lg'>
      <div className='flex items-center gap-2'>
        <span className="font-['Pretendard_Variable'] text-xs text-gray-700">https://</span>
        <div className='flex-1' />
      </div>
    </div>
  </div>
);

const AccessibilityTestPanel = () => (
  <div className='flex flex-col h-full p-4 bg-white border border-gray-200 rounded'>
    <div className='mb-6'>
      <h3 className="mb-1 font-['Pretendard_Variable'] text-lg font-semibold text-gray-800">접근성 검사</h3>
      <p className="font-['Pretendard_Variable'] text-xs text-gray-700">접근성 보고서를 확인할 링크를 입력해 주세요.</p>
    </div>
    <URLInput />
  </div>
);

const ResultsTablePanel = () => (
  <img
    src='/report-summary-mock.png'
    alt='WEBridge 웹 접근성 검사 요약 보고서 이미지'
    aria-hidden='true'
    draggable={false}
    className='w-full max-w-4xl rounded-2xl select-none pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100'
  />
);

const ReportPreviewSection = () => {
  const [showHeader, setShowHeader] = useState(false);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const playedRef = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          setTimeout(() => setShowHeader(true), 80); // 1) 헤더
          setTimeout(() => setShowLeft(true), 360); // 2) 좌측
          setTimeout(() => setShowRight(true), 740); // 3) 우측
        }
      },
      { threshold: 0.3 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className='relative w-full overflow-hidden rounded-2xl bg-white/70 backdrop-blur-sm border border-white/60 shadow-[0_18px_60px_rgba(30,64,175,0.15)]'
    >
      {/* 헤더: 위에서 아래로 페이드/슬라이드 */}
      <div
        className={[
          'transition-all duration-700 ease-out transform',
          showHeader ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4',
        ].join(' ')}
      >
        <ReportHeader />
      </div>

      {/* 본문 2열: 좌 → 우 순차 등장 */}
      <div className='flex flex-row items-stretch h-full gap-4 px-4 pt-4'>
        <div
          className={[
            'transition-all duration-700 ease-out transform flex-1 flex',
            showLeft ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6',
          ].join(' ')}
        >
          <AccessibilityTestPanel />
        </div>

        <div
          className={[
            'transition-all duration-700 ease-out transform',
            showRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6',
          ].join(' ')}
        >
          <ResultsTablePanel />
        </div>
      </div>

      <div className='absolute bottom-0 left-0 right-0 h-px bg-gray-300' />
    </div>
  );
};

/* -----------------------------
 * Feature (하단 연회색 배경 + 가운데 문구)
 * ---------------------------- */
const StatusIcon = ({ ok }: { ok: boolean }) =>
  ok ? (
    <svg className='w-5 h-5 text-blue-600' viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path d='M7 12l3 3 7-7' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  ) : (
    <svg className='w-5 h-5 text-rose-500' viewBox='0 0 24 24' fill='none'>
      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='2' />
      <path d='M12 7v6m0 4h.01' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
    </svg>
  );

// 기존 AlternativeTextDemo를 캐로우셀로 교체
const AltCard = ({ variant, mounted }: { variant: 'good' | 'bad'; mounted: boolean }) => {
  const isGood = variant === 'good';
  return (
    <div
      className={[
        'flex items-center p-6 rounded-xl shadow-sm border transition-all duration-500 ease-out bg-white',
        isGood ? 'border-blue-200 ring-1 ring-blue-100' : 'border-rose-200 ring-1 ring-rose-100',
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
      ].join(' ')}
    >
      <img src='/example-shoes.png' alt='유아용 흰색 운동화' className='object-cover rounded-md h-28 w-28' />
      <div className='flex flex-col gap-1 ml-6'>
        <div
          className={[
            'flex w-full items-center gap-2 text-sm font-medium',
            isGood ? 'text-blue-600' : 'text-rose-500',
          ].join(' ')}
        >
          <StatusIcon ok={isGood} />
          {isGood ? '적절한 대체텍스트를 추천드려요.' : '대체텍스트가 적절하지 않습니다.'}
        </div>

        <div className='mt-1 rounded-md bg-gray-50 px-3 py-1.5 font-mono text-xs text-gray-700'>
          {isGood ? `<img src="product.jpg" alt="유아용 흰색 운동화" />` : `<img src="product.jpg" alt="" />`}
        </div>
      </div>
    </div>
  );
};

// 이전/다음/정지 컨트롤이 있는 캐로우셀
const AlternativeTextCarousel = () => {
  const slides: Array<'good' | 'bad'> = ['bad', 'good'];
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<number | null>(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  // mount animation
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 20);
    return () => window.clearTimeout(t);
  }, [index]);

  // autoplay
  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4000) as unknown as number;

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing, slides.length]);

  return (
    <div
      className='w-full max-w-xl'
      role='region'
      aria-roledescription='carousel'
      aria-label='대체 텍스트 예시 캐로우셀'
    >
      <div className='relative'>
        <AltCard key={slides[index]} variant={slides[index]} mounted={mounted} />

        {/* 컨트롤러 */}
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-2'>
            {slides.map((_, i) => (
              <button
                key={i}
                type='button'
                onClick={() => setIndex(i)}
                aria-label={`${i + 1}번째 슬라이드로 이동`}
                className={['h-2 w-2 rounded-full transition-colors', i === index ? 'bg-blue-600' : 'bg-gray-300'].join(
                  ' '
                )}
              />
            ))}
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={prev}
              className='px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50'
              aria-label='이전 이미지'
            >
              이전
            </button>
            <button
              type='button'
              onClick={() => setPlaying((p) => !p)}
              className='px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50'
              aria-pressed={!playing}
              aria-label={playing ? '자동 재생 정지' : '자동 재생 시작'}
            >
              {playing ? '정지' : '재생'}
            </button>
            <button
              type='button'
              onClick={next}
              className='px-3 py-1.5 text-xs rounded-md border border-gray-300 hover:bg-gray-50'
              aria-label='다음 이미지'
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureText = ({ title, description }: FeatureTextProps) => (
  <div className='flex-1 max-w-4xl text-left'>
    <h2 className='mb-6 text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[56px] lg:leading-[68px]'>
      {title.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </h2>
    <p className='text-lg leading-8 tracking-widest text-gray-800'>
      {description.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  </div>
);

const FeatureSectionAnimated = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(() => {}, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className='w-full bg-white py-28'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid w-full grid-cols-1 mt-16 gap-x-12 gap-y-20 lg:grid-cols-2'>
          <FadeInSection>
            <AlternativeTextCarousel />
          </FadeInSection>

          {/* 상단 오른쪽: 텍스트 */}
          <FadeInSection>
            <FeatureText
              title={'바쁜 일정 때문에 디테일을 놓친 채\n웹사이트를 마무리해야 했던 경험,\n분명 있으실 거예요.'}
              description={
                '웹브릿지는 자가 진단과 AI 수정 가이드를 통해\n한정된 시간 안에서도 놓치기 쉬운 부분까지 잡아내\n사이트 퀄리티를 확실히 높여 줍니다.'
              }
            />
          </FadeInSection>

          {/* 하단 왼쪽: 텍스트 */}
          <FadeInSection>
            <FeatureText
              title={'웹 접근성으로 웹사이트\n퀄리티를 완성하세요'}
              description={
                '웹 접근성 표준(KWCAG)을 기준으로 내 사이트의\n접근성을 자동 분석하고, 역할별로 필요한 액션을 추천해 드립니다.'
              }
            />
          </FadeInSection>

          {/* 하단 오른쪽: 리포트 카드(정적 이미지) */}
          <FadeInSection>
            <img src='/slide2.2.png' alt='WEBridge 접근성 보고서 화면 예시' />
          </FadeInSection>
        </div>
      </div>
    </section>
  );
};

/* -----------------------------
 * ✅ Testimonials (이미지 섹션 구현)
 * FeatureSectionAnimated 아래에 추가될 섹션
 * ---------------------------- */
type Testimonial = {
  quote: string;
  author: string;
};

const testimonials: Testimonial[] = [
  {
    quote: '웹접근성을 몰라서 벌금낼 뻔 했는데 웹브릿지 덕분에 해결했어요',
    author: '40세 스타트업 대표 김**님 후기',
  },
  {
    quote: '개발팀 설득이 늘 어려웠는데 웹브릿지 리포트로 왜 고쳐야 하는지가 정리돼서 바로 반영됐어요',
    author: '38세 스타트업 대표 한**님 후기',
  },
  {
    quote: '고령자 사용자 문의가 자꾸 들어왔는데 웹브릿지 진단 후 명도/폼 이슈 고치고 이탈이 줄었어요',
    author: '29세 프로덕트 매니저 이**님 후기',
  },
  {
    quote: '출시 앞두고 접근성 이슈가 걱정됐는데 대시보드에서 리스크가 한눈에 보여서 바로 정리됐어요',
    author: '32세 서비스 책임자 강**님 후기',
  },
];

const TestimonialsSection = () => {
  return (
    <section className='w-full bg-white py-28'>
      <div className='w-full px-6 mx-auto max-w-7xl md:px-10'>
        <FadeInSection>
          <h2 className='text-center text-[44px] md:text-5xl font-extrabold tracking-tight lg:leading-[68px] text-gray-900'>
            아무리 바빠도 디테일을 놓치고 싶지 않은,
            <br />
            책임감 있는 개발자의 이야기
          </h2>
        </FadeInSection>

        <div className='grid grid-cols-1 gap-6 mt-16 md:grid-cols-2 lg:grid-cols-4'>
          {testimonials.map((t, idx) => (
            <FadeInSection key={idx}>
              <figure
                className={[
                  'h-full min-h-[260px]',
                  'rounded-xl bg-white',
                  'border-2 border-blue-500/60',
                  'px-8 py-10',
                  'flex flex-col justify-between',
                ].join(' ')}
              >
                <blockquote className='break-keep text-[18px] font-semibold leading-8 text-gray-800'>
                  <span aria-hidden='true'>“ </span>
                  {t.quote}
                  <span aria-hidden='true'> ”</span>
                </blockquote>

                <figcaption className='pt-10 text-[13px] font-medium text-gray-600'>{t.author}</figcaption>
              </figure>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTAButton = () => (
  <button
    onClick={() => window.open('https://forms.gle/auwBzhYqpfT9ixEG8', '_blank')}
    className='flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
  >
    서비스 정식 출시 알림받기
  </button>
);

/* -----------------------------
 * HomePage
 * ---------------------------- */
export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className='w-full h-full scroll-smooth'>
      <section
        className={STYLES.section.hero}
        style={{
          background:
            'radial-gradient(900px 420px at 50% 0%, rgba(59,130,246,0.22) 0%, rgba(59,130,246,0.10) 55%, rgba(255,255,255,0) 100%), linear-gradient(180deg, #F6F7FA 0%, #C2D6FF 100%)',
        }}
      >
        <FadeInSection>
          <div className='px-6 pt-24 mx-auto max-w-7xl md:px-10'>
            <div className='flex flex-col items-center'>
              <MainTitle />
              <SubTitle />
              <ActionButtons />

              <div className='w-full mt-14'>
                <ReportPreviewSection />
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      <FeatureSectionAnimated />

      {/* ✅ 이미지 섹션: FeatureSectionAnimated 아래 추가 */}
      <TestimonialsSection />

      <section className={STYLES.section.cta}>
        <FadeInSection>
          <h2 className='mt-20 mb-14 text-5xl md:text-6xl font-bold tracking-wide leading-[64px] md:leading-[84px]'>
            지금 바로, 더 나은
            <br />웹 환경을 위한 첫 걸음
          </h2>
        </FadeInSection>
        <FadeInSection>
          <p className='mb-10 text-lg text-gray-200'>WEBridge와 함께 모두를 위한 웹을 만들어가요!</p>
        </FadeInSection>
        <FadeInSection>
          <CTAButton />
        </FadeInSection>
      </section>

      <footer className='w-full bg-white'>
        <div className='mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20 py-16'>
          <div className='flex items-center gap-2 mb-6'>
            <img src='/logo.svg' alt='WEBridge Logo' className='w-6 h-6' />
            <span className="font-['Pretendard_Variable'] text-2xl font-bold text-gray-900">WEBridge</span>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-12'>
            <div className='md:col-span-6'>
              <ul className='text-[15px] leading-7 text-gray-800'>
                <li>웹 접근성 자가 검진 솔루션</li>
                <li>
                  <span className='font-bold'>상호</span>
                  <span className='ml-2'>: 이너블(InAble)</span>
                </li>
                <li>
                  <span className='font-bold'>대표자명</span>
                  <span className='ml-2'>: 김은혜</span>
                </li>
                <li>
                  <span className='font-bold'>사업장 주소</span>
                  <span className='ml-2'>:</span>
                </li>
                <li>서울특별시 광진구 능동로 81 더 라움 펜트하우스 302-1호</li>
                <li>건국대학교 캠퍼스타운사업단 [공유오피스 InAble(이너블)]</li>
              </ul>
            </div>

            <div className='mt-16 md:col-span-4'>
              <ul className='text-[15px] leading-7 text-gray-800'>
                <li>
                  <span className='font-bold'>E-mail</span>
                  <span className='ml-2'>: inable25@gmail.com</span>
                </li>
                <li>
                  <span className='font-bold'>연락처</span>
                  <span className='ml-2'>: 010-4017-9140</span>
                </li>
                <li>
                  <span className='font-bold'>사업자 등록번호</span>
                  <span className='ml-2'>: 321-21-02249</span>
                </li>
                <li>
                  <span className='font-bold'>개인정보관리책임자</span>
                  <span className='ml-2'>: 김은혜</span>
                </li>
              </ul>
            </div>

            <div className='flex mt-32 text-center -w-full md:col-span-2 md:text-left'>
              <ul className='text-[15px] leading-7 text-gray-800'>
                <li>
                  <button
                    type='button'
                    onClick={() => navigate('/terms/service')}
                    className="font-['Pretendard_Variable'] text-gray-700 underline"
                  >
                    서비스 이용약관
                  </button>
                </li>
                <br className='md:hidden' />
                <li>
                  <button
                    type='button'
                    onClick={() => navigate('/terms/privacy-processing')}
                    className="font-['Pretendard_Variable'] font-bold text-gray-700 underline"
                  >
                    개인정보처리방침
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
