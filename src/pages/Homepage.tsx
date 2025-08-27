import { useNavigate } from "react-router-dom";
import { FadeInSection } from "@/components/common/FadeInSection";
import ArrowRightIcon from "@/assets/icons/ArrowRightIcon.svg";
import { useEffect, useRef, useState } from "react";

// 타입 정의
interface TableItem {
  id: number;
  item: string;
  compliance: string;
}
interface ActionButtonProps {
  onClick: () => void;
  variant: "primary" | "secondary";
  children: React.ReactNode;
  icon?: string;
}
interface FeatureTextProps {
  title: string;
  description: string;
}

// 상수
const TABLE_DATA: TableItem[] = [
  { id: 1, item: "적절한 대체 텍스트 제공", compliance: "23/50" },
  { id: 2, item: "자막 제공", compliance: "40/50" },
  { id: 3, item: "표의 구성", compliance: "30/50" },
  { id: 4, item: "자동 재생 금지", compliance: "이슈 내용" },
  { id: 5, item: "텍스트 콘텐츠의 명도 대비", compliance: "Cell Text" },
  { id: 6, item: "키보드 사용 보장", compliance: "Cell Text" },
  { id: 7, item: "레이블 제공", compliance: "Cell Text" },
];

const STYLES = {
  section: {
    hero: "flex flex-col items-center justify-center w-full px-6",
    feature: "w-full px-6 lg:px-8 py-24 bg-white",
    cta: "flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center text-white bg-gray-900",
  },
  text: {
    title:
      "text-zinc-800 text-6xl font-bold leading-[80px] font-['Pretendard_Variable'] text-center max-w-[1044px]",
    subtitle:
      "text-gray-600 text-xl font-medium leading-loose font-['Pretendard_Variable'] text-center max-w-[754px]",
    button: "text-xl font-semibold leading-loose font-['Pretendard_Variable']",
    tableHeader:
      "text-xs font-medium font-['Pretendard_Variable'] text-gray-600",
    tableCell: "text-xs font-medium font-['Pretendard_Variable'] text-gray-600",
  },
  button: {
    base: "flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-colors",
    primary:
      "bg-gradient-to-b from-blue-700 to-indigo-400 text-white hover:from-blue-800 hover:to-indigo-700",
    secondary:
      "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    error:
      "h-10 px-4 py-3 bg-blue-400 rounded-lg hover:bg-blue-500 transition-colors",
  },
} as const;

// 메인 컴포넌트들
const MainTitle = () => (
  <h1 className={STYLES.text.title}>
    WEBridge,
    <br />
    효율적인 웹 접근성 자가 검진 솔루션
  </h1>
);

const SubTitle = () => (
  <p className={STYLES.text.subtitle}>
    AI로 더 똑똑해진 웹 접근성 도구 웹브릿지, 알림 신청하고 제일 먼저
    경험하세요!
  </p>
);

const ActionButton = ({
  onClick,
  variant,
  children,
  icon,
}: ActionButtonProps) => (
  <button
    onClick={onClick}
    className={`${STYLES.button.base} ${STYLES.button[variant]}`}
  >
    <span className={STYLES.text.button}>{children}</span>
    {icon && <img src={icon} alt="다음으로 이동" className="w-6 h-6" />}
  </button>
);

const ActionButtons = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-wrap items-center justify-center gap-7">
      <ActionButton
        onClick={() => navigate("/dashboard")}
        variant="primary"
        icon={ArrowRightIcon}
      >
        접근성 검사하기
      </ActionButton>
      <ActionButton
        onClick={() => navigate("/accessibility")}
        variant="secondary"
      >
        웹 접근성 솔루션이란?
      </ActionButton>
    </div>
  );
};

// 리포트 관련 컴포넌트들
const ReportLogo = () => (
  <div className="relative w-10 h-10 overflow-hidden bg-white border border-gray-200 rounded-lg">
    <div className="absolute w-3 h-3 rounded-full left-1 top-3 bg-sky-300" />
    <div className="absolute left-2.5 top-3 w-3 h-3 rounded-full opacity-50 bg-blue-500" />
    <div className="absolute w-3 h-3 rounded-full left-6 top-3 bg-gradient-to-r from-cyan-300 to-blue-700" />
  </div>
);

const ReportHeader = () => (
  <div className="flex h-14 w-full items-center border-b border-gray-200 bg-white px-5 py-3.5">
    <div className="flex items-center gap-3">
      <ReportLogo />
      <span className="font-['Pretendard_Variable'] text-xl font-bold text-gray-900">
        WEBridge
      </span>
    </div>
  </div>
);

const URLInput = () => (
  <div className="w-full max-w-sm">
    <div className="relative p-3 bg-white border-2 border-blue-600 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-['Pretendard_Variable'] text-xs text-gray-500">
          https://
        </span>
        <div className="flex-1" />
      </div>
    </div>
  </div>
);

const AccessibilityTestPanel = () => (
  <div className="max-w-4xl p-4 border-t border-gray-200 rounded w-96 border-x bg-white/40">
    <div className="mb-6">
      <h3 className="mb-1 font-['Pretendard_Variable'] text-lg font-semibold text-gray-800">
        접근성 검사
      </h3>
      <p className="font-['Pretendard_Variable'] text-xs text-gray-600">
        접근성 보고서를 확인할 링크를 입력해 주세요.
      </p>
    </div>
    <URLInput />
  </div>
);

const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <th className="border-t border-b border-gray-300 px-4 py-2.5 text-left">
    <span className={STYLES.text.tableHeader}>{children}</span>
  </th>
);
const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-4 border-b border-gray-300">
    <span className={STYLES.text.tableCell}>{children}</span>
  </td>
);

const ErrorCheckButton = () => (
  <button
    className={`${STYLES.button.error} font-['Pretendard_Variable'] text-xs font-medium text-white`}
  >
    오류 확인
  </button>
);

const ResultsTable = () => (
  <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-['Pretendard_Variable'] text-base font-semibold text-gray-800">
        항목별 결과
      </h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <TableHeader>순번</TableHeader>
            <TableHeader>항목</TableHeader>
            <TableHeader>준수율</TableHeader>
            <TableHeader>오류 확인</TableHeader>
          </tr>
        </thead>
        <tbody>
          {TABLE_DATA.map((item) => (
            <tr key={item.id}>
              <TableCell>{item.id}</TableCell>
              <TableCell>{item.item}</TableCell>
              <TableCell>{item.compliance}</TableCell>
              <TableCell>
                <ErrorCheckButton />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ResultsTablePanel = () => (
  <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-100 bg-white/40 p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
    <div className="border border-gray-200 rounded-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-['Pretendard_Variable'] text-lg font-semibold text-black">
          WEBridge 웹 접근성 검사 요약 보고서
        </h2>
      </div>
      <div className="p-6">
        <div className="h-64 overflow-hidden">
          <ResultsTable />
        </div>
      </div>
    </div>
  </div>
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

    // 뷰포트에 들어오면 한 번만 재생
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playedRef.current) {
          playedRef.current = true;
          setTimeout(() => setShowHeader(true), 60); // 1) 헤더
          setTimeout(() => setShowLeft(true), 380); // 2) 왼쪽 카드
          setTimeout(() => setShowRight(true), 760); // 3) 오른쪽 카드
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
      className="relative w-full overflow-hidden rounded-t-2xl bg-sky-50"
    >
      {/* 헤더: 위에서 아래로 페이드/슬라이드 */}
      <div
        className={[
          "transition-all duration-700 ease-out transform",
          showHeader ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
        ].join(" ")}
      >
        <ReportHeader />
      </div>

      {/* 본문 2열: 좌 → 우 순차 등장 */}
      <div className="flex flex-row gap-4 px-4 pt-4">
        <div
          className={[
            "transition-all duration-700 ease-out transform",
            showLeft ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6",
          ].join(" ")}
        >
          <AccessibilityTestPanel />
        </div>

        <div
          className={[
            "transition-all duration-700 ease-out transform",
            showRight ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6",
          ].join(" ")}
        >
          <ResultsTablePanel />
        </div>
      </div>

      {/* 바닥 그라데이션/라인 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-sky-50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300" />
    </div>
  );
};

// Feature 구성 - 이미지처럼 좌우 2열 (상: 카드+텍스트, 하: 텍스트+이미지)
const StatusIcon = ({ ok }: { ok: boolean }) =>
  ok ? (
    <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 12l3 3 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v6m0 4h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

const AlternativeTextDemo = ({ variant }: { variant: "good" | "bad" }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(t);
  }, [variant]);

  const isGood = variant === "good";

  return (
    <div
      className={[
        "flex items-center w-full max-w-xl p-6 rounded-xl shadow-sm border transition-all duration-500 ease-out bg-white",
        isGood
          ? "border-blue-200 ring-1 ring-blue-100"
          : "border-rose-200 ring-1 ring-rose-100",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
      ].join(" ")}
    >
      <img
        src="/example-shoes.png"
        alt="유아용 흰색 운동화"
        className="object-cover rounded-md h-28 w-28"
      />
      <div className="flex flex-col gap-1 ml-6">
        <div
          className={[
            "flex items-center gap-2 text-sm font-medium",
            isGood ? "text-blue-600" : "text-rose-500",
          ].join(" ")}
        >
          <StatusIcon ok={isGood} />
          {isGood
            ? "적절한 대체텍스트를 추천드려요."
            : "대체텍스트가 적절하지 않습니다."}
        </div>

        <div className="mt-1 rounded-md bg-gray-50 px-3 py-1.5 font-mono text-xs text-gray-600">
          {isGood
            ? `<img src="product.jpg" alt="유아용 흰색 운동화" />`
            : `<img src="product.jpg" alt="" />`}
        </div>
      </div>
    </div>
  );
};

const FeatureText = ({ title, description }: FeatureTextProps) => (
  <div className="flex-1 max-w-xl text-left">
    <h2 className="mb-6 text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 leading-[56px] lg:leading-[68px]">
      {title.split("\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </h2>
    <p className="text-lg leading-8 text-gray-700">
      {description.split("\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </p>
  </div>
);

const CTAButton = () => (
  <button
    onClick={() => window.open("https://forms.gle/auwBzhYqpfT9ixEG8", "_blank")}
    className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-semibold text-white transition-opacity rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 hover:opacity-90"
  >
    서비스 정식 출시 알림받기
  </button>
);

// Feature Section (번갈아 표시)
const FeatureSectionAnimated = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [variant, setVariant] = useState<"good" | "bad">("bad"); // 시작 상태
  const visibleRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // 보임 상태로 "진입"할 때만 토글 (머무는 동안 반복 토글 방지)
        if (entry.isIntersecting && !visibleRef.current) {
          visibleRef.current = true;
          setVariant((v) => (v === "good" ? "bad" : "good"));
        } else if (!entry.isIntersecting && visibleRef.current) {
          visibleRef.current = false;
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={STYLES.section.feature}>
      <div className="grid w-full grid-cols-1 mx-auto max-w-7xl place-items-start gap-x-24 gap-y-28 lg:grid-cols-2">
        {/* 상단 왼쪽: (토글되는) 카드 */}
        <FadeInSection>
          {/* key로 재마운트 → 자연스러운 페이드/슬라이드 */}
          <AlternativeTextDemo key={variant} variant={variant} />
        </FadeInSection>

        {/* 상단 오른쪽: 텍스트 */}
        <FadeInSection>
          <FeatureText
            title={"한 번의 클릭으로\n웹 접근성 진단부터 개선까지"}
            description={
              "웹 접근성에 특화된 AI 솔루션 WEBridge는\n한 번의 클릭으로 비싸고 복잡한 컨설팅 없이도,\n웹 접근성을 쉽게 준수할 수 있습니다."
            }
          />
        </FadeInSection>

        {/* 하단 왼쪽: 텍스트 */}
        <FadeInSection>
          <FeatureText
            title={"최소의 리소스로,\n웹 접근성 진단부터 개선까지"}
            description={
              "웹 접근성에 특화된 AI 솔루션 WEBridge는\n무엇이 잘못되었고, 어떻게 고쳐야 할지\n명확한 리포트와 함께 수정 가이드를 제공합니다."
            }
          />
        </FadeInSection>

        {/* 하단 오른쪽: 리포트 카드(정적 이미지) */}
        <FadeInSection>
          <img src="/slide2.2.png" alt="WEBridge 접근성 보고서 화면 예시" />
        </FadeInSection>
      </div>
    </section>
  );
};

// 메인 HomePage 컴포넌트
export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full scroll-smooth">
      {/* Hero Section */}
      <section
        className={STYLES.section.hero}
        style={{
          background: "linear-gradient(180deg, #F7F8FA 0%, #C2D6FF 100%)",
        }}
      >
        <FadeInSection>
          <div className="px-8 pt-20 max-w-7xl">
            <div className="flex flex-col items-center gap-8">
              <MainTitle />
              <div className="flex flex-col items-center w-full gap-12">
                <div className="min-w-[520px] flex flex-col items-center gap-9">
                  <SubTitle />
                  <ActionButtons />
                </div>
                <ReportPreviewSection />
              </div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* Feature Section (1번 이미지 레이아웃) */}
      <FeatureSectionAnimated />

      {/* CTA Section */}
      <section className={STYLES.section.cta}>
        <FadeInSection>
          <h2 className="mt-20 mb-14 text-5xl md:text-6xl font-bold tracking-wide leading-[64px] md:leading-[84px]">
            지금 바로, 더 나은
            <br />웹 환경을 위한 첫 걸음
          </h2>
        </FadeInSection>
        <FadeInSection>
          <p className="mb-10 text-lg text-gray-300">
            WEBridge와 함께 모두를 위한 웹을 만들어가요!
          </p>
        </FadeInSection>
        <FadeInSection>
          <CTAButton />
        </FadeInSection>
      </section>

      {/* Footer (2번 이미지 레이아웃) */}
      <footer className="w-full bg-white">
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-12 lg:px-20 py-16">
          {/* 헤더(브랜드) */}
          <div className="flex items-center gap-2 mb-6">
            <img src="/logo.svg" alt="WEBridge Logo" className="w-6 h-6" />
            <span className="font-['Pretendard_Variable'] text-2xl font-bold text-gray-900">
              WEBridge
            </span>
          </div>

          {/* 본문 3열: 좌(설명/주소) | 중(연락처/사업자) | 우(링크) */}
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* 좌측 */}
            <div className="md:col-span-6">
              <ul className="text-[15px] leading-7 text-gray-700">
                <li>웹 접근성 자가 검진 솔루션</li>
                <li>
                  <span className="font-bold">상호</span>
                  <span className="ml-2">: 이너블(InAble)</span>
                </li>
                <li>
                  <span className="font-bold">대표자명</span>
                  <span className="ml-2">: 김은혜</span>
                </li>
                <li>
                  <span className="font-bold">사업장 주소</span>
                  <span className="ml-2">:</span>
                </li>
                <li>서울특별시 광진구 능동로 81 더 라움 펜트하우스 302-1호</li>
                <li>건국대학교 캠퍼스타운사업단 [공유오피스 InAble(이너블)]</li>
              </ul>
            </div>

            {/* 가운데 */}
            <div className="mt-16 md:col-span-4">
              <ul className="text-[15px] leading-7 text-gray-700">
                <li>
                  <span className="font-bold">E-mail</span>
                  <span className="ml-2">: inable25@gmail.com</span>
                </li>
                <li>
                  <span className="font-bold">연락처</span>
                  <span className="ml-2">: 010-4017-9140</span>
                </li>
                <li>
                  <span className="font-bold">사업자 등록번호</span>
                  <span className="ml-2">: 321-21-02249</span>
                </li>
                <li>
                  <span className="font-bold">개인정보관리책임자</span>
                  <span className="ml-2">: 김은혜</span>
                </li>
              </ul>
            </div>

            {/* 우측 링크 */}
            <div className="flex mt-32 text-center -w-full md:col-span-2 md:text-left">
              <ul className="text-[15px] leading-7 text-gray-700">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/terms/service")}
                    className="font-['Pretendard_Variable'] text-gray-600 underline" // 굵게 제거
                  >
                    서비스 이용약관
                  </button>
                </li>
                <br className="md:hidden" />
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/terms/privacy-processing")}
                    className="font-['Pretendard_Variable'] font-bold text-gray-600 underline" // 이 항목만 굵게
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
