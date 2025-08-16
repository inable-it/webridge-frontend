import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "@/components/common/GoogleLoginButton";
import { useState } from "react";
import { useLoginMutation } from "@/features/api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/store/userSlice";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await login({ email, password }).unwrap();

      // 토큰 저장
      localStorage.setItem("accessToken", response.access);
      localStorage.setItem("refreshToken", response.refresh);

      // 유저정보 저장
      dispatch(setUser(response.user));

      toast({
        title: "로그인 성공",
        description: `${response.user.name}님 환영합니다!`,
      });
      // 로그인 성공시 메인페이지 이동
      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 실패", error);
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">로그인</h1>

        {/* 이메일 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* 상태 유지 + 비밀번호 찾기 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">로그인 상태 유지</Label>
          </div>
          {/* 비밀번호 찾기 버튼 - 클릭시 /password-reset 페이지로 이동 */}
          <Link
            to="/password-reset"
            className="text-blue-600 transition-colors hover:underline"
          >
            비밀번호 찾기
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <Button
          className="w-full text-white bg-blue-600 hover:bg-blue-700"
          onClick={handleLogin}
        >
          로그인
        </Button>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">또는</span>
          </div>
        </div>

        {/* 구글 로그인 */}
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLoginButton />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default LoginPage;
