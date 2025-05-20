import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-start justify-center h-full px-8 py-20 space-y-6">
      <span className="text-sm font-medium text-blue-600">Content</span>

      <div>
        <h2 className="text-3xl font-semibold text-gray-800">
          AI 기반의 웹 접근성 자가 검진 도구
        </h2>
        <h1 className="mt-2 text-5xl font-bold text-gray-900">WEBridge</h1>
      </div>

      <p className="text-gray-500">~ 웹브릿지 관련 설명문 ~</p>

      <Button className="mt-4" onClick={() => navigate("/signup")}>
        회원 가입
      </Button>
    </div>
  );
};

export default HomePage;
