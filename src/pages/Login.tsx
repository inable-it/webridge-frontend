import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md space-y-6">
        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="Placeholder" />
        </div>

        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Placeholder text" />
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>
          <Link to="#" className="text-blue-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Submit */}
        <Button className="w-full bg-blue-600 hover:bg-blue-700">Log In</Button>

        {/* Footer Text */}
        <p className="text-xs text-center text-gray-500">
          Vestibulum faucibus odio vitae arcu auctor lectus.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
