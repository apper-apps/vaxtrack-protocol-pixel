import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className, 
  type = "text",
  error = false,
  ...props 
}, ref) => {
  const baseStyles = "block w-full px-3 py-2 border rounded-md shadow-sm text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors";
  
  const stateStyles = error 
    ? "border-red-300 focus:border-red-500 focus:ring-red-500" 
    : "border-secondary-200 focus:border-primary-500 focus:ring-primary-500";

  return (
    <input
      type={type}
      className={cn(
        baseStyles,
        stateStyles,
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;