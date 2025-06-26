import { Navigate, useLocation } from "react-router-dom";

export const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = !!localStorage.getItem("accessToken"); // 혹은 context/redux에서 가져오기
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
