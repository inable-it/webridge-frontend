import { BaseLayout } from "@/layout/BaseLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/Homepage";
import SignupPage from "./pages/SignUp";
import LoginPage from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <BaseLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="login" element={<LoginPage />} />
          {/* 기타 라우트 */}
        </Routes>
      </BaseLayout>
    </BrowserRouter>
  );
}

export default App;
