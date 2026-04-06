import React from "react";

export function Input(props: any) {
  return <input className="w-full border rounded-xl p-3" {...props} />;
}

export function TextArea(props: any) {
  return (
    <textarea className="w-full border rounded-xl p-3" {...props}></textarea>
  );
}

export function DateInput(props: any) {
  return (
    <input
      type="date"
      className="w-full border rounded-xl p-3 height-[50px]"
      {...props}
    />
  );
}
