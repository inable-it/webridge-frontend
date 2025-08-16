import HomePage from "@/pages/Homepage";
import SignupPage from "@/pages/SignUp";
import LoginPage from "@/pages/Login";
import { useRoutes } from "react-router-dom";
import { SimpleLayout } from "@/layout/SimpleLayout";
import { BaseLayout } from "@/layout/BaseLayout";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Toaster } from "@/components/ui/toaster";
import TeamIntro from "@/pages/TeamIntro";
import AccessibilityIntro from "@/pages/AccessibilityIntro";
import DashboardPage from "@/pages/DashboardPage";
import MyInfoPage from "@/pages/MyInfoPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import FeedbackPage from "@/pages/FeedbackPage";
import PasswordResetConfirmPage from "@/pages/PasswordResetConfirmPage";
import TermsAgreementPage from "@/pages/TermsAgreementPage";

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
        { path: "my-info", element: <MyInfoPage /> }, // 추가
        { path: "feedback", element: <FeedbackPage /> }, // 추가
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
