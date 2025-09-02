import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { usePasswordResetMutation } from "@/features/api/authApi";
import { X } from "lucide-react";

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [passwordReset, { isLoading }] = usePasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }
    setEmailError("");

    try {
      await passwordReset({ email }).unwrap();
      setShowModal(true); // 전송 완료 모달 열기
    } catch (err: any) {
      console.error("비밀번호 재설정 요청 실패", err);
      if (err?.status === 400 && err?.data) {
        const errorMessage =
          err.data.message ||
          err.data.email?.[0] ||
          err.data.error ||
          "입력 데이터 검증 오류";
        setEmailError(errorMessage);
      } else {
        setEmailError(
          err?.data?.message || "비밀번호 재설정 요청 중 오류가 발생했습니다."
        );
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              비밀번호 재설정
            </h1>
          </div>
          <div className="space-y-1 text-gray-700">
            <p>가입 시 등록한 이메일 주소를 입력해 주세요.</p>
            <p>비밀번호 재설정 링크를 보내드려요.</p>
          </div>
        </div>

        {/* 이메일 입력 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={handleEmailChange}
            required
            className={`h-12 ${
              emailError ? "border-red-500 focus:border-red-500" : ""
            }`}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* 전송 버튼 */}
        <Button
          type="submit"
          className="w-full h-12 text-white bg-blue-500 hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "전송 중..." : "이메일 전송 받기"}
        </Button>

        {/* 로그인으로 돌아가기 */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </form>

      {/* 전송 완료 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md p-8 bg-white rounded-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute flex items-center justify-center text-gray-700 border-2 border-gray-600 rounded-full w-9 h-9 top-4 right-4 hover:text-gray-900 hover:border-gray-700"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5 text-center">
              <h2 className="text-xl font-bold text-gray-900">전송 완료</h2>
              <p className="text-gray-700">
                <span className="font-medium">{email}</span> 로
                <br /> 비밀번호 재설정 링크를 보냈어요.
              </p>

              <div className="flex gap-2">
                <Button
                  className="flex-1 text-white bg-blue-500 h-11 hover:bg-blue-600"
                  onClick={() => {
                    setShowModal(false);
                    navigate("/login");
                  }}
                >
                  로그인으로 이동
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setShowModal(false)}
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordResetPage;
