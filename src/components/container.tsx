import React from "react";

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 p-4 mx-auto flex-1 w-[90%] max-w-[80rem] bg-white/45 overflow-y-auto opacity-0 animate-[fadeInSlideUp_0.6s_ease-out_forwards]">
      {children}
    </div>
  );
}
