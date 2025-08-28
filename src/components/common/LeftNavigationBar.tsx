import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { setActiveMenu } from "@/features/store/menuSlice";
import type { RootState } from "@/app/store";
import { useNavigate } from "react-router-dom";
import { menuItems } from "@/constants/menu";

export const LNB = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeMenu = useSelector((state: RootState) => state.menu.activeMenu);

  const handleMenuClick = (label: string, path: string) => {
    dispatch(setActiveMenu(label));
    navigate(path);
  };

  return (
    <div className="flex flex-col justify-between h-full p-4 w-[260px] bg-white border-r">
      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs text-gray-700">메뉴</p>
          <div className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => (
              <Button
                key={label}
                variant="outline"
                onClick={() => handleMenuClick(label, path)}
                className={`flex justify-between items-center w-full text-sm h-12 rounded-xl ${
                  activeMenu === label
                    ? "bg-blue-100 border-blue-300 text-blue-600"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {label}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-700" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
