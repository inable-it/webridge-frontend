import { BaseLayout } from "@/layout/BaseLayout";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "@/pages/Homepage";
import SignupPage from "./pages/SignUp";

function App() {
  return (
    <BrowserRouter>
      <BaseLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="signup" element={<SignupPage />} />
          {/* 기타 라우트 */}
        </Routes>
      </BaseLayout>
    </BrowserRouter>
  );
}

export default App;
