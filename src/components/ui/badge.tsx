import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
}

export function Badge({ className = "", variant = "default", children, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none";

  let variantStyles = "bg-primary text-primary-foreground";
  if (variant === "secondary") {
    variantStyles = "bg-secondary/80 text-secondary-foreground border border-border/40";
  } else if (variant === "outline") {
    variantStyles = "border border-border/60 text-foreground bg-secondary/30";
  } else if (variant === "success") {
    variantStyles = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30";
  } else if (variant === "destructive") {
    variantStyles = "bg-destructive/10 text-destructive border border-destructive/30";
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
