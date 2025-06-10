import HomePage from "@/pages/Homepage";
import SignupPage from "@/pages/SignUp";
import LoginPage from "@/pages/Login";
import { useRoutes } from "react-router-dom";
import { SimpleLayout } from "@/layout/SimpleLayout";
import { BaseLayout } from "@/layout/BaseLayout";

function App() {
  const routes = useRoutes([
    {
      path: "/",
      element: <SimpleLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "login", element: <LoginPage /> },
        { path: "signup", element: <SignupPage /> },
      ],
    },
    {
      path: "/home",
      element: <BaseLayout />,
      children: [
        // 이후 /app/other 등 다른 내부 페이지 추가 가능
      ],
    },
  ]);

  return routes;
}

export default App;
