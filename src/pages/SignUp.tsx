import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FcGoogle } from "react-icons/fc";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export const SignupPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      {/* 좌우 2단 레이아웃 */}
      <div className="grid w-full grid-cols-1 gap-10 max-w-7xl md:grid-cols-2">
        {/* 왼쪽: Add Company */}
        <div className="pr-8 space-y-6 border-r">
          <h2 className="text-xl font-semibold text-center">add company</h2>
          <form className="space-y-4">
            <Input type="text" placeholder="company name" />
            <Button className="w-full">Continue</Button>
          </form>
        </div>

        {/* 오른쪽: Signup Form */}
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold text-center">
            Create an account
          </h1>

          {/* Google Login */}
          <Button
            variant="outline"
            className="flex items-center justify-center w-full gap-2"
          >
            <FcGoogle className="w-5 h-5" />
            Continue With Google
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <Separator className="flex-1" />
            <span className="text-xs text-gray-400">Or</span>
            <Separator className="flex-1" />
          </div>

          {/* Email Signup Form */}
          <form className="space-y-4">
            <Input type="email" placeholder="Email or Phone" required />
            <Input type="password" placeholder="Password" required />
            <Input type="text" placeholder="Full Name" />
            <Input type="text" placeholder="Company Name" />

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>

          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-black underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
