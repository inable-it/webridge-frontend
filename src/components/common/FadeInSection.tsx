import React from "react";
import { useInView } from "@/hooks/useInView";

export const FadeInSection = ({ children }: { children: React.ReactNode }) => {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
};
