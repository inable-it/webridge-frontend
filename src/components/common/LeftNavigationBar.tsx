import { ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveMenu } from "@/features/store/menuSlice";
import type { RootState } from "@/app/store";
import { useLocation, useNavigate } from "react-router-dom";
import { menuItems } from "@/constants/menu";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export const LNB = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const activeMenu = useSelector((state: RootState) => state.menu.activeMenu);

  const handleMenuClick = (label: string, path: string) => {
    dispatch(setActiveMenu(label));
    navigate(path);
  };

  const isItemActive = (label: string, path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    if (path === "/scans") {
      return location.pathname.startsWith("/scan");
    }
    if (location.pathname.startsWith(path)) {
      return true;
    }
    return activeMenu === label;
  };

  useEffect(() => {
    const current = menuItems.find((item) => isItemActive(item.label, item.path));
    if (current && activeMenu !== current.label) {
      dispatch(setActiveMenu(current.label));
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col justify-between h-full p-4 w-[260px] bg-white border-r border-gray-200">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500">메뉴</p>
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => {
              const active = isItemActive(label, path);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleMenuClick(label, path)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex justify-between items-center w-full text-sm h-12 rounded-xl transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#155DFC]",
                    active
                      ? "px-[15px] border-2 border-[#155DFC] bg-blue-50 text-[#155DFC] font-semibold"
                      : "px-4 border border-gray-200 bg-white text-[#344054] font-medium hover:px-[15px] hover:border-2 hover:border-[#155DFC] hover:bg-blue-50 hover:text-[#155DFC]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        active
                          ? "text-[#155DFC]"
                          : "text-gray-600 group-hover:text-[#155DFC]"
                      )}
                    />
                    <span>{label}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-colors",
                      active
                        ? "text-[#155DFC]"
                        : "text-gray-400 group-hover:text-[#155DFC]"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
