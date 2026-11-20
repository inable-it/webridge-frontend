import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminLoginMutation } from "@/features/api/adminApi";
import { getAdminToken } from "@/components/admin/RequireAdmin";
import { toast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  useEffect(() => {
    if (getAdminToken()) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg("아이디와 비밀번호를 모두 입력해 주세요.");
      return;
    }

    try {
      const res = await adminLogin({
        username: username.trim(),
        password,
      }).unwrap();

      if (!res?.access_token) {
        setErrorMsg("로그인 토큰을 받지 못했습니다.");
        return;
      }

      localStorage.setItem("admin_access_token", res.access_token);
      if (res.user) {
        localStorage.setItem("admin_user", JSON.stringify(res.user));
      }

      toast({
        title: "관리자 로그인 성공",
        description: `${res.user?.name || username}님, 환영합니다.`,
      });
      navigate("/admin", { replace: true });
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.data?.detail ||
        "아이디 또는 비밀번호가 올바르지 않습니다.";
      setErrorMsg(msg);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#EEF3FB]">
      <Card className="w-full max-w-md bg-white border-gray-200 shadow-lg">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center w-12 h-12 mx-auto text-white bg-blue-600 rounded-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              WEBridge 관리자 로그인
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm text-gray-500">
              관리자 전용 계정으로 로그인하세요.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-username">관리자 아이디</Label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <Input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  placeholder="inableit"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">비밀번호</Label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  disabled={isLoading}
                />
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="p-3 text-xs font-medium text-red-700 border border-red-200 rounded-lg bg-red-50"
              >
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "관리자 로그인"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
