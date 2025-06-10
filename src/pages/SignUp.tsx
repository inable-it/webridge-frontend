import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FcGoogle } from "react-icons/fc";

export const SignupPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-left text-gray-900">회원가입</h1>

        {/* 이름 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="name">
            이름<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input id="name" type="text" placeholder="이름" required />
        </div>

        {/* 이메일 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input id="email" type="email" placeholder="이메일" required />
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
            required
          />
        </div>

        {/* 약관 동의 */}
        <div className="flex items-center gap-2 text-sm text-left">
          <Checkbox id="agree" />
          <Label htmlFor="agree" className="text-gray-700">
            서비스 이용약관에 동의합니다.
          </Label>
        </div>

        {/* 회원가입 버튼 */}
        <Button className="w-full text-white bg-blue-600 hover:bg-blue-700">
          회원가입
        </Button>

        {/* 구분선 */}
        <div className="flex items-center gap-2">
          <Separator className="flex-1" />
          <span className="text-xs text-gray-400">또는</span>
          <Separator className="flex-1" />
        </div>

        {/* 구글 로그인 */}
        <Button
          variant="outline"
          className="flex items-center justify-center w-full gap-2 bg-gray-100 hover:bg-gray-200"
        >
          <FcGoogle className="w-5 h-5" />
          Google로 계속하기
        </Button>

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
      </div>
    </div>
  );
};

export default SignupPage;
