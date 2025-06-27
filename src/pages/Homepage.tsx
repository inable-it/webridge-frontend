import { useNavigate } from "react-router-dom";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Button } from "@/components/ui/button";

export const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-full scroll-smooth">
      {/* Slide 1 */}
      <section className="h-screen w-full flex flex-col justify-between items-center px-6 pt-16 bg-gradient-to-b from-[#e9f0ff] to-[#f2f6ff]">
        <FadeInSection>
          <div className="mt-12 text-center">
            <h1 className="mb-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              WEBridge,
              <br />
              효율적인 웹 접근성 자가 검진 솔루션
            </h1>
            <p className="mb-6 text-gray-600">
              까다로운 웹 접근성은 이제 그만! 이제는 WEBridge, 웹브릿지로
              해결하세요.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                onClick={() => navigate("/dashboard")}
              >
                접근성 검사하기 →
              </button>
              <button
                className="px-6 py-3 font-semibold text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                onClick={() => navigate("/accessibility")}
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
              <img
                src="/slide2.1.png"
                alt="접근성 검사 입력 박스"
                className="w-full max-w-[600px] flex-1"
              />
              <div className="flex-1 text-center">
                <h2 className="mb-4 text-4xl font-bold leading-snug text-gray-900">
                  한 번의 클릭으로
                  <br />웹 접근성 진단부터 개선까지
                </h2>
                <p className="text-lg leading-relaxed text-gray-700">
                  웹 접근성에 특화된 AI 솔루션 WEBridge는
                  <br />
                  한 번의 클릭으로 비싸고 복잡한 컨설팅 없이도,
                  <br />웹 접근성을 쉽게 준수할 수 있습니다.
                </p>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="flex flex-row items-center gap-12">
              <div className="flex-1 text-center">
                <h3 className="mb-4 text-3xl font-semibold leading-snug text-gray-900">
                  최소의 리소스로,
                  <br />웹 접근성 진단부터 개선까지
                </h3>
                <p className="text-lg leading-relaxed text-gray-700">
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
          <h2 className="mb-4 text-5xl font-bold leading-snug md:text-6xl">
            지금 바로, 더 나은
            <br />웹 환경을 위한 첫 걸음
          </h2>
        </FadeInSection>
        <FadeInSection>
          <p className="mb-8 text-lg text-gray-300">
            WEBridge와 함께 모두를 위한 웹을 만들어가요!
          </p>
        </FadeInSection>
        <FadeInSection>
          <Button
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 text-white transition bg-blue-600 rounded-full hover:bg-blue-700"
          >
            서비스 사용하기
          </Button>
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
