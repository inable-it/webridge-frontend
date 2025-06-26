import HomePage from "@/pages/Homepage";
import SignupPage from "@/pages/SignUp";
import LoginPage from "@/pages/Login";
import { useRoutes } from "react-router-dom";
import { SimpleLayout } from "@/layout/SimpleLayout";
import { BaseLayout } from "@/layout/BaseLayout";
import TeamIntro from "@/pages/TeamIntro";
import AccessibilityIntro from "@/pages/AccessibilityIntro";
import DashboardPage from "@/pages/DashboardPage";
import { MyInfoPage } from "@/pages/MyInfoPage"; // 추가
import { FeedbackPage } from "@/pages/FeedbackPage"; // 추가
import { RequireAuth } from "@/components/common/RequireAuth";

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

  return routes;
}

export default App;
