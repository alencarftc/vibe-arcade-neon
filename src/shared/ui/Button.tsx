import { cn } from "@/shared/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "uppercase tracking-wider transition-all duration-200 cursor-pointer",
        "border rounded-lg focus:outline-none",
        variant === "primary" &&
          "border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover:shadow-[0_0_12px_var(--color-neon-blue)]",
        variant === "ghost" &&
          "border-transparent text-white/70 hover:text-white hover:bg-white/5",
        variant === "danger" &&
          "border-neon-pink text-neon-pink hover:bg-neon-pink/10 hover:shadow-[0_0_12px_var(--color-neon-pink)]",
        size === "sm" && "px-3 py-1.5 text-xs",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        props.disabled && "opacity-40 cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
