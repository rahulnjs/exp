import React from "react";

export function Card({ children, className, ...props }: any) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: any) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
