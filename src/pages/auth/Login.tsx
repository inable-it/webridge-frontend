import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import {
  useLoginMutation,
  useSocialLoginMutation,
} from "@/features/api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/store/userSlice";
import { toast } from "@/hooks/use-toast";

const LoginPageContent = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useLoginMutation();
  const [socialLogin] = useSocialLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleTokenStorage = (access: string, refresh: string) => {
    if (access && access.trim() !== "") {
      localStorage.setItem("accessToken", access);
    }
    if (refresh && refresh.trim() !== "") {
      localStorage.setItem("refreshToken", refresh);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await login({ email, password }).unwrap();
      handleTokenStorage(response.access, response.refresh);
      dispatch(setUser(response.user));
      toast({
        title: "로그인 성공",
        description: `${response.user.name}님 환영합니다!`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("로그인 실패", error);
      alert("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const result = await socialLogin({
          provider: "google",
          access_token: tokenResponse.access_token,
        });

        if ("data" in result) {
          const response = result.data;
          if (
            response?.status === "terms_agreement_required" ||
            response?.message === "서비스 이용을 위해 약관 동의가 필요합니다."
          ) {
            if (response.access?.trim())
              localStorage.setItem("accessToken", response.access);
            if (response.refresh?.trim())
              localStorage.setItem("refreshToken", response.refresh);
            navigate("/terms-agreement", {
              state: {
                userEmail: response.user_info?.email || "",
                userName: response.user_info?.name || "",
                userId: response.user_id,
                message:
                  response.message ||
                  "서비스 이용을 위해 약관 동의가 필요합니다.",
                profileImage: response.user_info?.profile_image || null,
                provider: response.user_info?.provider || "google",
                isNew: response.is_new || false,
              },
            });
          } else if (response) {
            handleTokenStorage(response.access, response.refresh);
            dispatch(setUser(response.user));
            toast({
              title: "로그인 성공",
              description: `${response.user.name}님 환영합니다!`,
            });
            navigate("/dashboard");
          }
        } else if ("error" in result) {
          const errorData = (result.error as any)?.data;
          if (
            errorData?.status === "terms_agreement_required" ||
            errorData?.message === "서비스 이용을 위해 약관 동의가 필요합니다."
          ) {
            if (errorData?.access?.trim())
              localStorage.setItem("accessToken", errorData.access);
            if (errorData?.refresh?.trim())
              localStorage.setItem("refreshToken", errorData.refresh);
            navigate("/terms-agreement", {
              state: {
                userEmail: errorData?.user_info?.email || "",
                userName: errorData?.user_info?.name || "",
                userId: errorData?.user_id,
                message:
                  errorData?.message ||
                  "서비스 이용을 위해 약관 동의가 필요합니다.",
                profileImage: errorData?.user_info?.profile_image || null,
                provider: errorData?.user_info?.provider || "google",
                isNew: errorData?.is_new || false,
              },
            });
          } else if ((result.error as any)?.status === 400) {
            alert("로그인 요청에 문제가 있습니다. 다시 시도해주세요.");
          } else {
            alert("Google 로그인 중 오류가 발생했습니다.");
          }
        }
      } catch (error: any) {
        console.error("소셜 로그인 예외:", error);
        alert("Google 로그인 중 예외가 발생했습니다.");
      }
    },
    onError: () => {
      alert("Google 로그인에 실패했습니다.");
    },
  });

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
            className="h-12 border border-[#727272]"
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
            className="h-12 border border-[#727272]"
          />
        </div>

        {/* 상태 유지 + 비밀번호 찾기 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">로그인 상태 유지</Label>
          </div>
          <Link
            to="/password-reset"
            className="text-blue-600 transition-colors hover:underline"
          >
            비밀번호 찾기
          </Link>
        </div>

        {/* 로그인 버튼 */}
        <Button
          className="w-full h-12 text-white bg-blue-600 hover:bg-blue-700"
          onClick={handleLogin}
        >
          로그인
        </Button>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[#727272]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-700 bg-white">또는</span>
          </div>
        </div>

        {/* 구글 로그인 */}
        <button
          onClick={() => googleLogin()}
          className="flex items-center justify-center gap-4 w-full h-11 rounded-lg bg-gray-100 hover:bg-gray-200 shadow text-gray-800 text-[16px] font-medium"
          type="button"
        >
          <img src="/google.svg" alt="Google Logo" className="w-6 h-6" />
          Google로 계속하기
        </button>

        {/* 회원가입 링크 */}
        <div className="text-sm text-center text-gray-700">
          계정이 없으신가요?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-600 hover:underline"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
