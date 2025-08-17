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
import DashboardPage from "@/pages/DashboardPage";
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

function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <SimpleLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "login", element: <LoginPage /> },
        { path: "signup", element: <SignupPage /> },
        { path: "team", element: <TeamIntro /> },
        { path: "accessibility", element: <AccessibilityIntro /> },
        { path: "password-reset", element: <PasswordResetPage /> },
        { path: "reset-password", element: <PasswordResetConfirmPage /> },
        { path: "terms-agreement", element: <TermsAgreementPage /> },
        // 약관 페이지들
        { path: "terms/service", element: <ServiceTermsPage /> },
        { path: "terms/privacy-policy", element: <PrivacyPolicyPage /> },
        { path: "terms/marketing-consent", element: <MarketingConsentPage /> },
        {
          path: "terms/privacy-processing",
          element: <PrivacyProcessingPage />,
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
        { path: "dashboard", element: <DashboardPage /> },
        { path: "my-info", element: <MyInfoPage /> },
        { path: "feedback", element: <FeedbackPage /> },
        { path: "news", element: <NewsPage /> },
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
