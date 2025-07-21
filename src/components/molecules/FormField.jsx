import React from "react";
import { cn } from "@/utils/cn";
import Label from "@/components/atoms/Label";
import Input from "@/components/atoms/Input";

const FormField = ({ 
  label, 
  required = false, 
  error, 
  className,
  children,
  ...inputProps 
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <Label required={required} htmlFor={inputProps.id}>
          {label}
        </Label>
      )}
      {children || <Input error={!!error} {...inputProps} />}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default FormField;