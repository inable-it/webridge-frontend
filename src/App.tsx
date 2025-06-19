import HomePage from "@/pages/Homepage";
import SignupPage from "@/pages/SignUp";
import LoginPage from "@/pages/Login";
import { useRoutes } from "react-router-dom";
import { SimpleLayout } from "@/layout/SimpleLayout";
import { BaseLayout } from "@/layout/BaseLayout";
import TeamIntro from "@/pages/TeamIntro";
import AccessibilityIntro from "@/pages/AccessibilityIntro";
import DashboardPage from "@/pages/DashboardPage";

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
      element: <BaseLayout />,
      children: [
        { path: "dashboard", element: <DashboardPage /> },
        // 이후 /app/other 등 다른 내부 페이지 추가 가능
      ],
    },
  ]);

  return routes;
}

export default App;
