import { useGoogleLogin } from "@react-oauth/google";
import { useSocialLoginMutation } from "@/features/api/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/store/userSlice";
import { useNavigate } from "react-router-dom";

interface GoogleLoginButtonProps {
  onSuccess?: () => void; // 회원가입 페이지에서 이메일 인증 상태 업데이트용
  variant?: "login" | "signup"; // 로그인/회원가입 구분
}

const GoogleLoginButton = ({
  onSuccess,
  variant = "login",
}: GoogleLoginButtonProps) => {
  const [socialLogin] = useSocialLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        // RTK Query는 성공적인 응답만 unwrap 하므로,
        // 실제로는 응답 상태를 확인하기 위해 .unwrap() 없이 처리해야 합니다
        const result = await socialLogin({
          provider: "google",
          access_token: tokenResponse.access_token,
        });

        if ("data" in result) {
          const response = result.data;
          console.log("소셜 로그인 성공", response);

          // response가 정의되어 있는지 확인
          if (response) {
            // 200: 약관 동의가 완료된 사용자 - 바로 로그인
            // 토큰이 있고 빈 문자열이 아닌 경우에만 저장
            if (response.access && response.access.trim() !== "") {
              localStorage.setItem("accessToken", response.access);
            }
            if (response.refresh && response.refresh.trim() !== "") {
              localStorage.setItem("refreshToken", response.refresh);
            }

            // 유저 정보 Redux store에 저장
            dispatch(setUser(response.user));

            // 회원가입 페이지에서 호출된 경우
            if (variant === "signup" && onSuccess) {
              onSuccess(); // 이메일 인증 상태 업데이트
            } else {
              // 로그인 페이지에서 호출된 경우 대시보드로 이동
              navigate("/dashboard");
            }
          }
        } else if ("error" in result) {
          const error = result.error as any;
          const errorData = error?.data;

          // message 또는 status로 분기 처리
          if (
            errorData?.status === "terms_agreement_required" ||
            errorData?.message === "서비스 이용을 위해 약관 동의가 필요합니다."
          ) {
            // 202: 약관 동의가 되어 있지 않는 사용자
            // 중요: 약관 동의가 필요한 사용자도 임시 토큰을 받을 수 있음
            // 서버에서 임시 토큰을 제공하는지 확인하고 저장
            if (errorData?.access && errorData.access.trim() !== "") {
              localStorage.setItem("accessToken", errorData.access);
              console.log("임시 토큰 저장됨:", errorData.access);
            }
            if (errorData?.refresh && errorData.refresh.trim() !== "") {
              localStorage.setItem("refreshToken", errorData.refresh);
              console.log("임시 리프레시 토큰 저장됨:", errorData.refresh);
            }

            // 약관 동의 페이지로 이동
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
          } else if (error?.status === 400) {
            // 400: 클라이언트 에러
            console.error(
              "클라이언트 에러:",
              errorData?.message || "잘못된 요청입니다."
            );
            alert("로그인 요청에 문제가 있습니다. 다시 시도해주세요.");

            // 회원가입 페이지에서 실패한 경우에도 콜백 호출 (이메일 설정용)
            if (variant === "signup" && onSuccess) {
              onSuccess();
            }
          } else {
            // 기타 에러
            console.error("기타 에러:", error);
            alert("Google 로그인 중 오류가 발생했습니다.");

            // 회원가입 페이지에서 실패한 경우에도 콜백 호출 (이메일 설정용)
            if (variant === "signup" && onSuccess) {
              onSuccess();
            }
          }
        }
      } catch (error: any) {
        console.error("소셜 로그인 예외:", error);
        alert("Google 로그인 중 예외가 발생했습니다.");

        // 회원가입 페이지에서 실패한 경우에도 콜백 호출 (이메일 설정용)
        if (variant === "signup" && onSuccess) {
          onSuccess();
        }
      }
    },
    onError: () => {
      console.log("Google Login 실패");
      alert("Google 로그인에 실패했습니다.");
    },
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center gap-4 w-full h-11 rounded-lg bg-gray-100 hover:bg-gray-200 shadow text-gray-800 text-[16px] font-medium"
    >
      <img src="/google.svg" alt="Google Logo" className="w-6 h-6" />
      Google로 계속하기
    </button>
  );
};

export default GoogleLoginButton;
