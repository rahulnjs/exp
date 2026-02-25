import React from "react";

export function Select({ children, onValueChange, defaultValue }: any) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="w-full border rounded-xl p-3"
    >
      {children}
    </select>
  );
}

export const SelectContent = ({ children }: any) => <>{children}</>;
export const SelectItem = ({ value, children }: any) => (
  <option value={value}>{children}</option>
);
export const SelectTrigger = ({ children }: any) => <>{children}</>;
export const SelectValue = ({ placeholder }) => null;
