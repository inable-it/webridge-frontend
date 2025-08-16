import { useState } from "react";
import { useRegisterMutation } from "@/features/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "@/components/common/GoogleLoginButton";

export const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
    agree: false,
  });

  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.agree) {
      alert("약관에 동의해야 가입할 수 있습니다.");
      return;
    }

    if (form.password !== form.password2) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password2: form.password2,
        terms_agreed: form.agree,
      }).unwrap();
      alert("회원가입 성공!");
      // 회원가입 성공 후 리다이렉트 또는 추가 작업
      navigate("/login");
    } catch (err) {
      console.error("회원가입 실패", err);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-left text-gray-900">회원가입</h1>

        {/* 이름 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="name">
            이름<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="이름"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* 이메일 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* 비밀번호 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="password">
            비밀번호<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* 비밀번호 확인 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="password2">
            비밀번호 확인<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="password2"
            type="password"
            placeholder="비밀번호 확인"
            value={form.password2}
            onChange={handleChange}
            required
          />
        </div>

        {/* 약관 동의 */}
        <div className="flex items-center gap-2 text-sm text-left">
          <Checkbox
            id="agree"
            checked={form.agree}
            onCheckedChange={(checked) => {
              setForm((prev) => ({ ...prev, agree: checked === true }));
            }}
          />
          <Label htmlFor="agree" className="text-gray-700">
            서비스 이용약관에 동의합니다.
          </Label>
        </div>

        {/* 회원가입 버튼 */}
        <Button
          type="submit"
          className="w-full text-white bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? "가입 중..." : "회원가입"}
        </Button>

        {/* 구분선 */}
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-gray-400">또는</span>
          <Separator className="flex-1" />
        </div>

        {/* 구글 로그인 */}
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLoginButton />
        </GoogleOAuthProvider>

        {/* 약관 링크 */}
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <a href="#" className="hover:underline">
            개인정보처리방침
          </a>
          <span>|</span>
          <a href="#" className="hover:underline">
            서비스 약관
          </a>
        </div>
      </form>
    </div>
  );
};

export default SignupPage;
