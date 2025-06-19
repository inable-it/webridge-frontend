import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import GoogleLoginButton from "@/components/common/GoogleLoginButton";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        {/* 제목 */}
        <h1 className="text-2xl font-semibold text-gray-900">로그인</h1>

        {/* 이메일 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input id="email" type="email" placeholder="이메일 주소" />
        </div>

        {/* 비밀번호 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="password">
            비밀번호<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input id="password" type="password" placeholder="비밀번호" />
        </div>

        {/* 상태 유지 + 비밀번호 찾기 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">로그인 상태 유지</Label>
          </div>
          <Link to="#" className="text-blue-600 hover:underline">
            비밀번호 찾기
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <Button className="w-full text-white bg-blue-600 hover:bg-blue-700">
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

        {/* 구글 로그인 버튼 */}
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLoginButton />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default LoginPage;
