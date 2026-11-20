import { Navigate, useLocation } from "react-router-dom";

export const getAdminToken = (): string | null => {
  try {
    const token = localStorage.getItem("admin_access_token");
    if (!token) return null;
    const trimmed = token.trim();
    return trimmed && trimmed !== "undefined" && trimmed !== "null"
      ? trimmed
      : null;
  } catch {
    return null;
  }
};

export const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
