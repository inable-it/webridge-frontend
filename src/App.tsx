import HomePage from "@/pages/Homepage";
import SignupPage from "@/pages/SignUp";
import LoginPage from "@/pages/Login";
import { useRoutes } from "react-router-dom";
import { SimpleLayout } from "@/layout/SimpleLayout";
import { BaseLayout } from "@/layout/BaseLayout";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Toaster } from "@/components/ui/toaster";
import TeamIntro from "@/pages/notion/TeamIntro";
import AccessibilityIntro from "@/pages/notion/AccessibilityIntro";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import MyInfoPage from "@/pages/MyInfoPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import FeedbackPage from "@/pages/FeedbackPage";
import PasswordResetConfirmPage from "@/pages/PasswordResetConfirmPage";
import TermsAgreementPage from "@/pages/TermsAgreementPage";
import ServiceTermsPage from "@/pages/notion/ServiceTermsPage";
import PrivacyPolicyPage from "@/pages/notion/PrivacyPolicyPage";
import MarketingConsentPage from "@/pages/notion/MarketingConsentPage";
import PrivacyProcessingPage from "@/pages/notion/PrivacyProcessingPage";
import NewsPage from "@/pages/notion/NewsPage";
import AccessibilityScanDetailPage from "./pages/AccessibilityScanDetailPage";
import SurveyPage from "@/pages/SurveyPage";
import ScanHistoryPage from "@/pages/ScanHistoryPage";
import { useEffect } from "react";

function RouteWithTitle({ element, title }: { element: React.ReactNode, title: string }) {
    useEffect(() => {
        document.title = title;
    }, [title]);

    return <>{element}</>;
}

function App() {
    const routes = useRoutes([
        {
            path: "/",
            element: <SimpleLayout />,
            children: [
                { index: true, element: <RouteWithTitle element={<HomePage />} title="홈 | WEBridge" /> },
                { path: "login", element: <RouteWithTitle element={<LoginPage />} title="로그인 | WEBridge" /> },
                { path: "signup", element: <RouteWithTitle element={<SignupPage />} title="회원가입 | WEBridge" /> },
                { path: "team", element: <RouteWithTitle element={<TeamIntro />} title="팀 소개 | WEBridge" /> },
                { path: "accessibility", element: <RouteWithTitle element={<AccessibilityIntro />} title="웹 접근성 소개 | WEBridge" /> },
                { path: "password-reset", element: <RouteWithTitle element={<PasswordResetPage />} title="비밀번호 재설정 | WEBridge" /> },
                { path: "reset-password", element: <RouteWithTitle element={<PasswordResetConfirmPage />} title="비밀번호 재설정 확인 | WEBridge" /> },
                { path: "terms-agreement", element: <RouteWithTitle element={<TermsAgreementPage />} title="이용약관 동의 | WEBridge" /> },
                { path: "survey", element: <RouteWithTitle element={<SurveyPage />} title="설문조사 | WEBridge" /> },
                // 약관 페이지들
                { path: "terms/service", element: <RouteWithTitle element={<ServiceTermsPage />} title="서비스 이용약관 | WEBridge" /> },
                { path: "terms/privacy-policy", element: <RouteWithTitle element={<PrivacyPolicyPage />} title="개인정보수집 동의 | WEBridge" /> },
                { path: "terms/marketing-consent", element: <RouteWithTitle element={<MarketingConsentPage />} title="마케팅 동의 | WEBridge" /> },
                {
                    path: "terms/privacy-processing",
                    element: <RouteWithTitle element={<PrivacyProcessingPage />} title="개인정보 처리지침 | WEBridge" />,
                },
            ],
        },
        {
            path: "/",
            element: (
                <RequireAuth>
                    <BaseLayout />
                </RequireAuth>
            ),
            children: [
                { path: "dashboard", element: <RouteWithTitle element={<DashboardPage />} title="접근성 검사 | WEBridge" /> },
                { path: "scans", element: <RouteWithTitle element={<ScanHistoryPage />} title="검사 이력 | WEBridge" /> },
                {
                    path: "scan/:scanId/:category",
                    element: <RouteWithTitle element={<AccessibilityScanDetailPage />} title="상세 보고서 | WEBridge" />,
                },
                { path: "my-info", element: <RouteWithTitle element={<MyInfoPage />} title="내 정보 | WEBridge" /> },
                { path: "feedback", element: <RouteWithTitle element={<FeedbackPage />} title="피드백 | WEBridge" /> },
                { path: "news", element: <RouteWithTitle element={<NewsPage />} title="소식지 | WEBridge" /> },
            ],
        },
    ]);

    return (
        <>
            {routes}
            <Toaster />
        </>
    );
}

export default App;