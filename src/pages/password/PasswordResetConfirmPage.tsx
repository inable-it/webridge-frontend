import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePasswordResetConfirmMutation } from "@/features/api/authApi";
import { Key, Eye, EyeOff } from "lucide-react";

const PasswordResetConfirmPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    newPassword: "",
    confirmPassword: "",
    general: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [passwordResetConfirm, { isLoading }] =
    usePasswordResetConfirmMutation();

  // URL에서 uid와 token 추출
  const uid = searchParams.get("uid") || "";
  const token = searchParams.get("token") || "";

  useEffect(() => {
    // uid 또는 token이 없으면 에러 처리
    if (!uid || !token) {
      setErrors((prev) => ({
        ...prev,
        general:
          "유효하지 않은 링크입니다. 비밀번호 재설정을 다시 요청해주세요.",
      }));
    }
  }, [uid, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));

    // 입력 시 해당 필드 에러 초기화
    if (id === "newPassword") {
      setErrors((prev) => ({ ...prev, newPassword: "" }));
    } else if (id === "confirmPassword") {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "비밀번호는 최소 8자 이상이어야 합니다.";
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const criteria = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
    if (criteria < 2) {
      return "영문자, 숫자, 특수문자 중 2가지 이상이 포함되어야 합니다.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 초기화
    setErrors({ newPassword: "", confirmPassword: "", general: "" });

    // 유효성 검사
    const passwordError = validatePassword(form.newPassword);
    if (passwordError) {
      setErrors((prev) => ({ ...prev, newPassword: passwordError }));
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "비밀번호가 일치하지 않습니다.",
      }));
      return;
    }

    if (!uid || !token) {
      setErrors((prev) => ({ ...prev, general: "유효하지 않은 링크입니다." }));
      return;
    }

    try {
      await passwordResetConfirm({
        uid,
        token,
        new_password: form.newPassword,
        new_password2: form.confirmPassword,
      }).unwrap();

      setIsSuccess(true);
    } catch (err: any) {
      console.error("비밀번호 재설정 실패", err);

      if (err?.status === 400 && err?.data) {
        // 필드별 에러 처리
        if (err.data.new_password) {
          setErrors((prev) => ({
            ...prev,
            newPassword: err.data.new_password[0],
          }));
        } else if (err.data.new_password2) {
          setErrors((prev) => ({
            ...prev,
            confirmPassword: err.data.new_password2[0],
          }));
        } else if (err.data.token) {
          setErrors((prev) => ({
            ...prev,
            general:
              "토큰이 만료되었습니다. 비밀번호 재설정을 다시 요청해주세요.",
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general:
              err.data.error || "비밀번호 재설정 중 오류가 발생했습니다.",
          }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "비밀번호 재설정 중 오류가 발생했습니다.",
        }));
      }
    }
  };

  // 성공 화면
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 bg-white">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Key className="w-12 h-12 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              비밀번호가 변경되었습니다.
            </h1>
          </div>

          <Button
            onClick={() => navigate("/login")}
            className="w-full text-white bg-blue-500 hover:bg-blue-600"
          >
            로그인 화면으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900">새 비밀번호 설정</h1>
          <p className="text-gray-600">이전과 다른 비밀번호를 입력해 주세요.</p>
        </div>

        {/* 전체 에러 메시지 */}
        {errors.general && (
          <div className="p-3 text-sm text-red-600 border border-red-200 rounded-md bg-red-50">
            {errors.general}
          </div>
        )}

        {/* 새 비밀번호 입력 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="newPassword">비밀번호</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="새 비밀번호"
              value={form.newPassword}
              onChange={handleChange}
              required
              className={`pr-10 ${
                errors.newPassword ? "border-red-500 focus:border-red-500" : ""
              }`}
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

          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
          )}

          <div className="space-y-1 text-xs text-red-500">
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
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className={`pr-10 ${
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500"
                  : ""
              }`}
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

          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* 변경 완료 버튼 */}
        <Button
          type="submit"
          className="w-full text-white bg-blue-500 hover:bg-blue-600"
          disabled={isLoading || !uid || !token}
        >
          {isLoading ? "변경 중..." : "비밀번호 변경하기"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordResetConfirmPage;
