import React from "react";
import type { LucideIcon } from "lucide-react";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "success";
  target?: "_blank" | "_self";
  rel?: string;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  href,
  onClick,
  icon: Icon,
  children,
  variant = "primary",
  target = "_self",
  rel = "",
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseStyles =
    "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer relative overflow-hidden group";

  const variantStyles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-slate-700 hover:bg-slate-800 text-white active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
    danger:
      "bg-red-600 hover:bg-red-700 text-white active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
    success:
      "bg-green-600 hover:bg-green-700 text-white active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed",
  };

  const hoverStyles = "hover:scale-[1.02] hover:-translate-y-0.5";

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`;

  // Shimmer effect overlay
  const ShimmerOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300 -skew-x-12"></div>
  );

  if (href) {
    return (
      <a href={href} target={target} rel={rel} className={combinedClassName}>
        <ShimmerOverlay />
        {Icon && (
          <Icon
            size={18}
            className="group-hover:scale-110 transition-transform"
          />
        )}
        <span className="relative z-10">{children}</span>
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={combinedClassName}>
      <ShimmerOverlay />
      {Icon && (
        <Icon
          size={18}
          className="group-hover:scale-110 transition-transform"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
