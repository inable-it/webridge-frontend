export const getToken = (k: "accessToken" | "refreshToken") => {
  try {
    const v = localStorage.getItem(k);
    if (!v) return null;
    const s = v.trim();
    return s && s !== "undefined" && s !== "null" ? s : null;
  } catch {
    return null;
  }
};
