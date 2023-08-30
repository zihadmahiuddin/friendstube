import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export default function Button({
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "rounded-xl bg-blue-400 text-slate-900 hover:bg-blue-500 disabled:bg-blue-300",
        className,
      )}
      {...rest}
    />
  );
}
