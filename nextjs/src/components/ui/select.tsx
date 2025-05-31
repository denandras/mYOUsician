"use client"

import * as React from "react"

// Simple Select wrapper for native select elements
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    onValueChange?: (value: string) => void
    value?: string
    children?: React.ReactNode
  }
>(({ className, children, onValueChange, onChange, value, disabled, ...props }, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onValueChange) {
      onValueChange(e.target.value)
    }
    if (onChange) {
      onChange(e)
    }
  }

  // Extract options from nested children (inside SelectContent)
  const extractOptions = (children: React.ReactNode): React.ReactNode[] => {
    const options: React.ReactNode[] = [];    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        if (child.type === SelectContent) {
          // Extract options from SelectContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.Children.forEach((child.props as any).children, contentChild => {
            if (React.isValidElement(contentChild) && contentChild.type === SelectItem) {
              options.push(contentChild);
            }
          });
        } else if (child.type === SelectItem) {
          // Direct SelectItem
          options.push(child);
        }
      }
    });
    
    return options;
  };

  const options = extractOptions(children);  // Extract placeholder from SelectValue if present
  let placeholder = "Select";
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && child.type === SelectValue) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      placeholder = (child.props as any).placeholder || placeholder;
    }
  });

  return (
    <select
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={ref}
      value={value || ''}
      onChange={handleChange}
      disabled={disabled}
      {...props}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options}
    </select>
  )
})
Select.displayName = "Select"

// These components are just for API compatibility with shadcn/ui
const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, children, ...props }, ref) => {
  // This component doesn't render anything - it's just for API compatibility
  return null;
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    placeholder?: string
  }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ placeholder: _placeholder, ..._props }, _ref) => {
  // This component doesn't render anything - it's just for API compatibility
  return null;
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ children: _children, ..._props }, _ref) => {
  // This component doesn't render anything - just passes through children for extraction
  return null;
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={className}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}