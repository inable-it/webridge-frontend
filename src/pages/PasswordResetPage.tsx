import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { usePasswordResetMutation } from "@/features/api/authApi";
import { Key, Eye, EyeOff } from "lucide-react";

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordReset, { isLoading }] = usePasswordResetMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return;
    }

    setEmailError(""); // 에러 메시지 초기화

    try {
      await passwordReset({ email }).unwrap();
      setIsSuccess(true);
    } catch (err: any) {
      console.error("비밀번호 재설정 요청 실패", err);

      // 400 에러 또는 기타 에러의 메시지 처리
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
    if (emailError) {
      setEmailError("");
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Key className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              새 비밀번호 설정
            </h1>
            <p className="text-gray-600">
              이전과 다른 비밀번호를 입력해 주세요.
            </p>
          </div>

          {/* 새 비밀번호 입력 */}
          <div className="space-y-1 text-left">
            <Label htmlFor="newPassword">새 비밀번호</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="새 비밀번호"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <p>*비밀번호는 최소 8자 이상이어야 합니다.</p>
              <p>*영문자, 숫자, 특수문자 중 2가지 이상이 포함되어야 합니다.</p>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-1 text-left">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="새 비밀번호 확인"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 변경 완료 버튼 */}
          <Button className="w-full text-white bg-blue-500 hover:bg-blue-600">
            이메일 전송 받기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <Key className="w-12 h-12 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">비밀번호 재설정</h1>
          <div className="space-y-1 text-gray-600">
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
            className={emailError ? "border-red-500 focus:border-red-500" : ""}
          />

          {/* 에러 메시지 표시 */}
          {emailError && (
            <p className="mt-1 text-sm text-red-500">{emailError}</p>
          )}
        </div>

        {/* 전송 버튼 */}
        <Button
          type="submit"
          className="w-full text-white bg-blue-500 hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "전송 중..." : "이메일 전송 받기"}
        </Button>

        {/* 로그인으로 돌아가기 */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordResetPage;
