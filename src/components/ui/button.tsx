import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  size?: "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-xl font-medium transition";
    const variants: Record<string, string> = {
      default: "bg-primary text-primary-foreground hover:opacity-95",
      outline:
        "border border-border bg-card text-foreground hover:bg-secondary",
    };
    const sizes: Record<string, string> = {
      md: "px-4 py-2 text-sm",
      lg: "px-5 py-4 text-base h-14",
    };
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
