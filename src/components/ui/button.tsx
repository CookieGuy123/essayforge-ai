import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-150 ease-out hover:scale-[1.015] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none select-none cursor-pointer";

    let variantStyles = "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-md";
    if (variant === "outline") {
      variantStyles = "border border-border/50 bg-card/60 dark:bg-slate-900/60 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground text-foreground shadow-xs hover:shadow-md";
    } else if (variant === "secondary") {
      variantStyles = "bg-secondary text-secondary-foreground hover:bg-secondary/80";
    } else if (variant === "ghost") {
      variantStyles = "hover:bg-accent/80 hover:text-accent-foreground text-foreground hover:scale-[1.01]";
    } else if (variant === "destructive") {
      variantStyles = "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs hover:shadow-md";
    }

    let sizeStyles = "h-10 px-4 py-2 text-sm rounded-xl";
    if (size === "sm") {
      sizeStyles = "h-8 px-3 text-xs rounded-lg";
    } else if (size === "lg") {
      sizeStyles = "h-12 px-6 text-base rounded-xl";
    } else if (size === "icon") {
      sizeStyles = "h-10 w-10 p-0 rounded-xl";
    }

    const combinedClassName = `${baseStyles} ${variantStyles} ${sizeStyles} ${className}`.trim();

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: `${combinedClassName} ${child.props.className || ""}`.trim(),
        ...props,
      });
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
