import { useGoogleLogin } from "@react-oauth/google";
import { useSocialLoginMutation } from "@/features/api/authApi";

const GoogleLoginButton = () => {
  const [socialLogin] = useSocialLoginMutation();

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        const response = await socialLogin({
          provider: "google",
          access_token: tokenResponse.access_token,
        }).unwrap();
        console.log("소셜 로그인 성공", response);
      } catch (error) {
        console.error("소셜 로그인 실패", error);
      }
    },
    onError: () => console.log("Google Login 실패"),
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center gap-4 w-full h-[50px] rounded-lg bg-[#f5f5f5] hover:bg-[#e0e0e0] shadow text-[#3c4043] text-[16px] font-medium"
    >
      <img src="/public/google.svg" alt="Google Logo" className="w-6 h-6" />
      Google로 계속하기
    </button>
  );
};

export default GoogleLoginButton;
