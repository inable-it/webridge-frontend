import { useState, useEffect } from "react";
import {
  useRegisterMutation,
  useRequestEmailVerificationMutation,
  useCheckEmailVerificationMutation,
  useSocialLoginMutation,
} from "@/features/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser } from "@/features/store/userSlice";
import {
  TERMS_CONFIG,
  getRequiredTermIds,
  type TermConfig,
} from "@/constants/termsConfig";

// 폼 초안 저장 키
const DRAFT_KEY = "signup_form_draft_v1";

// 초기 상태 정의
const INITIAL_FORM_STATE = {
  name: "",
  email: "",
  password: "",
  allAgree: false,
  ageAgree: false,
  serviceAgree: false,
  privacyAgree: false,
  marketingAgree: false,
};

const INITIAL_ERRORS_STATE = {
  name: "",
  email: "",
  password: "",
};

const SignupPageContent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 상태 관리
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState(INITIAL_ERRORS_STATE);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showModal, setShowModal] = useState(false); // 이메일 인증 안내 모달
  const [welcomeOpen, setWelcomeOpen] = useState(false); // 회원가입 완료 웰컴 모달
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // API 훅
  const [register, { isLoading }] = useRegisterMutation();
  const [requestEmailVerification, { isLoading: isRequestingVerification }] =
    useRequestEmailVerificationMutation();
  const [checkEmailVerification] = useCheckEmailVerificationMutation();
  const [socialLogin] = useSocialLoginMutation();

  // 유효성 검사 함수들
  const validators = {
    name: (name: string): string => {
      if (!name.trim()) return "이름을 입력해주세요.";
      if (name.length >= 10) return "이름은 10자 미만으로 작성해 주세요.";
      return "";
    },
    email: (email: string): string => {
      if (!email.trim()) return "이메일을 입력해주세요.";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return "유효한 이메일 주소를 입력해주세요.";
      return "";
    },
    password: (password: string): string => {
      if (!password) return "비밀번호를 입력해주세요.";
      if (password.length < 8) return "비밀번호는 최소 8자 이상이어야 합니다.";
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const criteria = [hasLetter, hasNumber, hasSpecial].filter(
        Boolean
      ).length;
      if (criteria < 2) {
        return "비밀번호에는 영문자, 숫자, 특수문자 중 두 가지 이상이 포함되어야 합니다.";
      }
      return "";
    },
  };

  // 페이지 포커스 시 이메일 인증 상태 확인
  useEffect(() => {
    const handleFocus = async () => {
      if (form.email && !emailVerified && !isGoogleUser) {
        try {
          await checkEmailVerification({ email: form.email }).unwrap();
          setEmailVerified(true);
        } catch {
          // 인증되지 않음(정상)
          return;
        }
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [form.email, emailVerified, isGoogleUser, checkEmailVerification]);

  // ===== 저장/이동 헬퍼 =====
  const saveDraftNow = (
    draftForm = form,
    draftEmailVerified = emailVerified,
    draftIsGoogleUser = isGoogleUser
  ) => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          form: draftForm,
          emailVerified: draftEmailVerified,
          isGoogleUser: draftIsGoogleUser,
        })
      );
    } catch {}
  };

  const go = (to: string) => {
    saveDraftNow(); // 이동 직전 저장
    navigate(to);
  };

  // 마운트 시 초안 복원
  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      if (saved?.form) setForm((prev) => ({ ...prev, ...saved.form }));
      if (typeof saved.emailVerified === "boolean")
        setEmailVerified(saved.emailVerified);
      if (typeof saved.isGoogleUser === "boolean")
        setIsGoogleUser(saved.isGoogleUser);
    } catch {}
  }, []);

  // 변경될 때마다 초안 자동 저장
  useEffect(() => {
    saveDraftNow();
  }, [form, emailVerified, isGoogleUser]);

  // 페이지 숨김/이탈 시에도 저장
  useEffect(() => {
    const onHide = () => saveDraftNow();
    const onVis = () => {
      if (document.visibilityState === "hidden") saveDraftNow();
    };
    window.addEventListener("pagehide", onHide);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [form, emailVerified, isGoogleUser]);

  // 유틸리티
  const resetEmailVerification = () => {
    setEmailVerified(false);
    setIsGoogleUser(false);
    saveDraftNow(form, false, isGoogleUser);
  };

  const handleTokenStorage = (access: string, refresh: string) => {
    if (access && access.trim() !== "")
      localStorage.setItem("accessToken", access);
    if (refresh && refresh.trim() !== "")
      localStorage.setItem("refreshToken", refresh);
  };

  // 입력 필드 변경
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [id]: value };
      saveDraftNow(newForm);
      return newForm;
    });

    const validator = validators[id as keyof typeof validators];
    const error = validator ? validator(value) : "";
    setErrors((prev) => ({ ...prev, [id]: error }));

    if (id === "email") resetEmailVerification();
  };

  // 체크박스 변경
  const handleCheckboxChange = (id: string, checked: boolean) => {
    if (id === "allAgree") {
      setForm((prev) => {
        const newForm = {
          ...prev,
          allAgree: checked,
          ageAgree: checked,
          serviceAgree: checked,
          privacyAgree: checked,
          marketingAgree: checked,
        };
        saveDraftNow(newForm);
        return newForm;
      });
    } else {
      setForm((prev) => {
        const newForm: typeof prev = { ...prev, [id]: checked } as any;
        newForm.allAgree =
          newForm.ageAgree &&
          newForm.serviceAgree &&
          newForm.privacyAgree &&
          newForm.marketingAgree;
        saveDraftNow(newForm);
        return newForm;
      });
    }
  };

  // 이메일 인증 요청
  const handleEmailVerification = async () => {
    const emailError = validators.email(form.email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: emailError }));
      return;
    }
    try {
      await requestEmailVerification({ email: form.email }).unwrap();
      setShowModal(true);
    } catch (err: any) {
      const errorMessage =
        err?.status === 400
          ? "이미 가입된 이메일입니다."
          : "이메일 인증 요청 중 오류가 발생했습니다.";
      setErrors((prev) => ({ ...prev, email: errorMessage }));
    }
  };

  // Google 로그인
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      try {
        localStorage.setItem("accessToken", tokenResponse.access_token);
        const result = await socialLogin({
          provider: "google",
          access_token: tokenResponse.access_token,
        });

        if ("data" in result) {
          const response = result.data;
          if (
            response &&
            (response.status === "terms_agreement_required" ||
              response.message === "서비스 이용을 위해 약관 동의가 필요합니다.")
          ) {
            if (response.access && response.access.trim() !== "") {
              localStorage.setItem("accessToken", response.access);
            }
            if (response.refresh && response.refresh.trim() !== "") {
              localStorage.setItem("refreshToken", response.refresh);
            }

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
            navigate("/dashboard");
          }
        } else if ("error" in result) {
          const error = result.error as any;
          if (error?.status === 400) {
            alert("로그인 요청에 문제가 있습니다. 다시 시도해주세요.");
          } else {
            alert("Google 로그인 중 오류가 발생했습니다.");
          }
        }
      } catch {
        alert("Google 로그인 중 예외가 발생했습니다.");
      }
    },
    onError: () => {
      alert("Google 로그인에 실패했습니다.");
    },
  });

  // 제출 가능 여부
  const canSubmit = () => {
    const hasValidForm =
      !errors.name &&
      !errors.email &&
      !errors.password &&
      form.name &&
      form.email &&
      form.password;

    const requiredTermIds = getRequiredTermIds();
    const hasRequiredAgreements = requiredTermIds.every(
      (termId) => form[termId as keyof typeof form] as boolean
    );

    const hasEmailVerification = emailVerified || isGoogleUser;

    return hasValidForm && hasRequiredAgreements && hasEmailVerification;
  };

  // 회원가입 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = {
      name: validators.name(form.name),
      email: validators.email(form.email),
      password: validators.password(form.password),
    };

    if (Object.values(validationErrors).some((error) => error)) {
      setErrors(validationErrors);
      return;
    }

    const requiredTermIds = getRequiredTermIds();
    const hasRequiredAgreements = requiredTermIds.every(
      (termId) => form[termId as keyof typeof form] as boolean
    );
    if (!hasRequiredAgreements) {
      alert("필수 약관에 동의해야 가입할 수 있습니다.");
      return;
    }
    if (!emailVerified && !isGoogleUser) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      const response = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        password2: form.password,
        service_terms_agreed: form.serviceAgree,
        age_verification_agreed: form.ageAgree,
        privacy_policy_agreed: form.privacyAgree,
        marketing_agreed: form.marketingAgree,
      }).unwrap();

      // 성공 처리
      sessionStorage.removeItem(DRAFT_KEY);
      localStorage.setItem("accessToken", response.access);
      localStorage.setItem("refreshToken", response.refresh);
      setWelcomeOpen(true);
    } catch (err: any) {
      if (err?.status === 400 && err?.data?.email) {
        setErrors((prev) => ({ ...prev, email: "이미 가입된 이메일입니다." }));
      } else {
        alert("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

    // 약관 체크박스 렌더링 (Checkbox input에도 aria-label 추가)
    const renderTermsCheckbox = (term: TermConfig) => {
        const isRequired = term.required;
        const ariaLabel =
            term.id === "ageAgree"
                ? "만 14세 이상입니다에 동의"
                : `${isRequired ? "필수" : "선택"} 약관 ${
                    term.linkText ?? term.id
                }에 동의`;

        const inputId = term.id;

        return (
            <div key={term.id} className="flex items-start gap-3">
                {/* 단일 네이티브 체크박스 */}
                <input
                    id={inputId}
                    type="checkbox"
                    aria-label={ariaLabel}
                    aria-required={isRequired ? true : undefined}
                    checked={form[term.id as keyof typeof form] as boolean}
                    onChange={(e) => handleCheckboxChange(term.id, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                />

                <div className="grid gap-1.5 leading-none">
                    <Label
                        htmlFor={inputId}
                        className="text-[15px] text-gray-800 cursor-pointer"
                    >
                        {term.id === "ageAgree" ? (
                            <>
                                {isRequired ? "(필수)" : "(선택)"}
                                <button className="underline">만 14세 이상</button>
                                <span className="text-gray-800">입니다.</span>
                            </>
                        ) : (
                            <>
                                {isRequired ? "(필수)" : "(선택)"}
                                {term.linkText && (
                                    <button
                                        type="button"
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (term.route) go(term.route);
                                        }}
                                        className="underline underline-offset-2 hover:text-blue-700"
                                    >
                                        {term.linkText}
                                    </button>
                                )}
                                <span>에 동의합니다.&nbsp;</span>
                            </>
                        )}
                    </Label>
                </div>
            </div>
        );
    };

    return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6"
        aria-label="회원가입 폼"
      >
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
        </div>

        {/* 이름 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            이름<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="이름"
            aria-label="이름 입력"
            value={form.name}
            onChange={handleInputChange}
            className={`w-full h-12 border border-[#727272]${
              errors.name ? " border-red-500" : ""
            }`}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* 이메일 */}
        <div className="space-y-1 text-left">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일<span className="ml-1 text-red-500">*</span>
          </Label>
        </div>
        <div className="flex gap-2 mt-0">
          <Input
            id="email"
            type="email"
            placeholder="이메일"
            aria-label="이메일 입력"
            value={form.email}
            onChange={handleInputChange}
            className={`flex-1 h-12 border border-[#727272]${
              errors.email ? " border-red-500" : ""
            }`}
          />
          <Button
            type="button"
            onClick={handleEmailVerification}
            disabled={
              isRequestingVerification ||
              !form.email ||
              emailVerified ||
              isGoogleUser
            }
            className="h-12 text-white bg-[#727272] border-0 hover:bg-blue-600"
            aria-label="이메일 인증 요청"
          >
            {isRequestingVerification
              ? "인증 중..."
              : emailVerified || isGoogleUser
              ? "인증완료"
              : "이메일 인증"}
          </Button>
        </div>

        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        {(emailVerified || isGoogleUser) && !errors.email && (
          <p className="mt-1 text-sm text-blue-600">인증되었습니다.</p>
        )}

        {/* 비밀번호 */}
        <div className="space-y-1 text-left">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-gray-700"
          >
            비밀번호<span className="ml-1 text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호"
            aria-label="비밀번호 입력"
            value={form.password}
            onChange={handleInputChange}
            className={`w-full h-12 border border-[#727272]${
              errors.password ? " border-red-500" : ""
            }`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

          {/* 약관 동의 */}
          <div className="space-y-3" aria-label="약관 동의 섹션">
              {/* 전체 동의 */}
              <div className="flex items-center gap-2 my-6 pb-5 border-b border-[#727272]">
                  <input
                      id="allAgree"
                      type="checkbox"
                      aria-label="모든 약관에 동의합니다"
                      checked={form.allAgree}
                      onChange={(e) => handleCheckboxChange("allAgree", e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 accent-blue-600 cursor-pointer"
                  />
                  <Label htmlFor="allAgree" className="text-sm text-gray-800">
                      모두 동의합니다.
                  </Label>
              </div>

              {TERMS_CONFIG.map(renderTermsCheckbox)}
          </div>

          {/* 회원가입 버튼 */}
        <Button
          type="submit"
          disabled={!canSubmit() || isLoading}
          className={`w-full h-12 text-base font-semibold text-white rounded-xl
          ${
            canSubmit()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-[#727272] cursor-not-allowed"
          }`}
          aria-label="회원가입 제출"
        >
          {isLoading ? "가입 중..." : "회원가입"}
        </Button>

        {/* 구분선 */}
        <div className="flex items-center gap-2" aria-hidden="true">
          <Separator className="flex-1" />
          <span className="text-xs text-gray-700">또는</span>
          <Separator className="flex-1" />
        </div>

        {/* 구글 로그인 */}
        <button
          onClick={() => googleLogin()}
          className="flex items-center justify-center gap-4 w-full h-11 rounded-lg bg-gray-100 hover:bg-gray-200 shadow text-gray-800 text-[16px] font-medium"
          type="button"
          aria-label="Google로 계속하기"
        >
          <img src="/google.svg" alt="Google Logo" className="w-6 h-6" />
          Google로 계속하기
        </button>

        {/* 하단 약관 링크 */}
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-700">
          <button
            type="button"
            onClick={() => go("/terms/privacy-processing")}
            className="font-bold hover:underline"
            aria-label="개인정보처리방침 보기"
          >
            개인정보처리방침
          </button>
          <span aria-hidden="true">|</span>
          <button
            type="button"
            onClick={() => go("/terms/service")}
            className="hover:underline"
            aria-label="서비스 이용약관 보기"
          >
            서비스 이용약관
          </button>
        </div>
      </form>

      {/* 이메일 인증 안내 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md p-8 bg-white rounded-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute flex items-center justify-center w-10 h-10 text-gray-700 border-2 border-gray-600 rounded-full top-6 right-6 hover:text-gray-900 hover:border-gray-700"
              aria-label="인증 안내 닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pt-4 space-y-6 text-center">
              <h2 className="text-xl font-bold text-gray-900">
                인증 메일이 발송되었습니다.
              </h2>

              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">{form.email}</span> 으로 메일이
                  발송되었습니다.
                </p>
                <p className="text-gray-700">
                  메일함에서 "인증하기" 버튼을 눌러주세요.
                </p>
              </div>

              <Button
                onClick={handleEmailVerification}
                disabled={isRequestingVerification}
                className="w-full py-3 text-base font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl"
                aria-label="인증 메일 재전송"
              >
                {isRequestingVerification ? "전송 중..." : "이메일 재전송"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 회원가입 완료 웰컴 모달 */}
      {welcomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="relative w-full max-w-md p-8 bg-white rounded-2xl">
            <button
              onClick={() => setWelcomeOpen(false)}
              className="absolute flex items-center justify-center w-10 h-10 text-gray-700 border-2 border-gray-600 rounded-full top-6 right-6 hover:text-gray-900 hover:border-gray-700"
              aria-label="웰컴 모달 닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.svg" alt="WEBridge" className="w-8 h-8" />
                <span className="text-xl font-bold text-gray-900">
                  WEBridge
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-gray-900">
                회원가입을 환영합니다!
              </h2>

              <div className="p-4 mx-auto text-gray-700 border rounded-xl bg-gray-50">
                <p>계정 생성이 완료되었습니다.</p>
                <p>로그인 전에 설문 조사를 완료해주세요</p>
              </div>

              <Button
                onClick={() => navigate("/survey")}
                className="w-full py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                aria-label="설문조사 시작하기"
              >
                설문조사 시작하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SignupPage = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <SignupPageContent />
    </GoogleOAuthProvider>
  );
};

export default SignupPage;
