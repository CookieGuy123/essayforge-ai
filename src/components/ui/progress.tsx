import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

export function Progress({ className = "", value = 0, max = 100, indicatorClassName = "", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={`relative h-3 w-full overflow-hidden rounded-full bg-secondary/80 ${className}`}
      {...props}
    >
      <div
        className={`h-full bg-primary transition-all duration-300 ${indicatorClassName}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
