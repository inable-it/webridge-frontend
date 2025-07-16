import { useNavigate } from "react-router-dom";
import { FadeInSection } from "@/components/common/FadeInSection";
import ArrowRightIcon from "@/assets/icons/ArrowRightIcon.svg";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full scroll-smooth">
      {/* Slide 1 */}
      <section className="h-screen w-full flex flex-col justify-between items-center px-6 pt-16 bg-gradient-to-b from-[#e9f0ff] to-[#f2f6ff]">
        <FadeInSection>
          <div className="mt-12 text-center">
            <h1 className="mt-12 mb-8 text-4xl font-extrabold leading-relaxed tracking-wide text-gray-900 sm:text-5xl">
              WEBridge,
              <br />
              효율적인 웹 접근성 자가 검진 솔루션
            </h1>
            <p className="mb-6 text-gray-600">
              AI로 더 똑똑해진 웹 접근성 도구 웹브릿지, 알림 신청하고 제일 먼저
              경험하세요!
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() =>
                  window.open("https://forms.gle/auwBzhYqpfT9ixEG8", "_blank")
                }
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "12px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(141deg, #155DFC 5.21%, #9ABAFF 196.72%)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "20px",
                  lineHeight: "20px",
                }}
              >
                서비스 정식 출시 알림받기
                <img
                  src={ArrowRightIcon}
                  alt="Arrow Right"
                  className="w-5 h-5"
                />
              </button>
              <button
                onClick={() => navigate("/accessibility")}
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "12px",
                  borderRadius: "12px",
                  border: "2px solid #155DFC",
                  background: "#FFF",
                  color: "#155DFC",
                  fontWeight: 600,
                  fontSize: "20px",
                  lineHeight: "24px",
                }}
              >
                웹 접근성 솔루션이란?
              </button>
            </div>
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="w-full max-w-5xl">
            <img
              src="/slide1.png"
              alt="웹 접근성 샘플 리포트"
              className="object-contain w-full"
            />
          </div>
        </FadeInSection>
      </section>

      {/* Slide 2 */}
      <section className="flex flex-col items-center justify-center min-h-screen px-8 py-24 bg-white">
        <div className="flex flex-col w-full gap-24 max-w-7xl">
          <FadeInSection>
            <div className="flex flex-row items-center gap-12">
              {/* 대체 텍스트 추천 박스 */}
              <div className="flex items-center justify-center flex-1">
                <div className="flex items-center w-full max-w-xl p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                  {/* 신발 이미지 */}
                  <img
                    src="/example-shoes.png"
                    alt="유아용 흰색 운동화"
                    className="object-cover rounded-md w-28 h-28"
                  />

                  {/* 텍스트 영역 */}
                  <div className="flex flex-col gap-1 ml-6 text-left">
                    {/* 체크 아이콘 */}
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      적절한 대체텍스트를 추천드려요.
                    </div>

                    {/* 코드 예시 */}
                    <div className="mt-1 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-md font-mono whitespace-pre">
                      {`<img src="product.jpg" alt="유아용 흰색 운동화" />`}
                    </div>
                  </div>
                </div>
              </div>

              {/* 설명 텍스트 */}
              <div className="flex-1 text-center">
                <h2 className="mb-4 text-4xl font-bold leading-snug text-gray-900">
                  한 번의 클릭으로
                  <br />웹 접근성 진단부터 개선까지
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  웹 접근성에 특화된 AI 솔루션 WEBridge는
                  <br />
                  이미지의 대체 텍스트처럼,
                  <br />
                  자동으로 문제를 분석하고 적절한 수정안을 제안합니다.
                </p>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="flex flex-row items-center gap-16">
              <div className="flex-1 text-center">
                <h2 className="mb-4 text-4xl font-bold leading-snug text-gray-900">
                  최소의 리소스로,
                  <br />웹 접근성 진단부터 개선까지
                </h2>
                <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                  웹 접근성에 특화된 AI 솔루션 WEBridge는
                  <br />
                  무엇이 잘못되었고, 어떻게 고쳐야 할지
                  <br />
                  명확한 리포트와 함께 수정 가이드를 제공합니다.
                </p>
              </div>

              <img
                src="/slide2.2.png"
                alt="접근성 리포트 샘플"
                className="w-full max-w-[700px] flex-1"
              />
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Slide 3 */}
      <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center text-white bg-gray-900">
        <FadeInSection>
          <h2 className="mt-20 text-5xl font-bold leading-relaxed tracking-wide mb-14 md:text-6xl">
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
          <button
            onClick={() =>
              window.open("https://forms.gle/auwBzhYqpfT9ixEG8", "_blank")
            }
            style={{
              display: "flex",
              padding: "16px 24px",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              borderRadius: "12px",
              background:
                "linear-gradient(141deg, #155DFC 5.21%, #9ABAFF 196.72%)",
              color: "white",
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: "24px",
            }}
          >
            서비스 정식 출시 알림받기
          </button>
        </FadeInSection>
      </section>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-4 px-16 py-12 text-sm text-gray-600 bg-white md:flex-row">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg" // 실제 로고 아이콘 경로로 변경
            alt="WEBridge Logo"
            className="w-6 h-6"
          />
          <span className="font-semibold text-gray-800">WEBridge</span>
        </div>
        <div className="text-center ">
          <p>웹 접근성 자가 검진 솔루션</p>
          <p>E-mail: inable25@gmail.com</p>
        </div>
      </footer>
    </div>
  );
};
export default HomePage;
