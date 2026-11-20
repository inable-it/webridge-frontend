import { Header } from "@/components/common/Header";
import { Outlet } from "react-router-dom";

export const SimpleLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main id="main-content" tabIndex={-1} className="flex-1 bg-gray-50 outline-none">
      <Outlet />
    </main>
  </div>
);
