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
>(({ className, children, onValueChange, onChange, value, disabled, ...props }, ref) => {  // Store the current selected value in local state to prevent flickering
  const [internalValue, setInternalValue] = React.useState(value ?? '');
  const [userHasInteracted, setUserHasInteracted] = React.useState(false);
    // Only update internal value from prop if user hasn't interacted or if it's a genuine external update
  React.useEffect(() => {
    const propValue = value ?? '';
    console.log('🔥 Select useEffect:', { propValue, internalValue, userHasInteracted, willUpdate: !userHasInteracted || (propValue !== internalValue && propValue !== '') });
    // Only sync if user hasn't interacted yet, or if the prop value is different from what we expect
    if (!userHasInteracted || (propValue !== internalValue && propValue !== '')) {
      setInternalValue(propValue);
    }
  }, [value, userHasInteracted, internalValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    console.log('🚀 Select handleChange:', { newValue, oldInternalValue: internalValue });
    
    // Mark that user has interacted
    setUserHasInteracted(true);
    
    // Update internal state immediately
    setInternalValue(newValue);
    
    // Call onValueChange for parent state updates
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    // Then call original onChange if provided
    if (onChange) {
      onChange(e);
    }
  }

  // Extract options from nested children (inside SelectContent)
  const extractOptions = (children: React.ReactNode): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    
    React.Children.forEach(children, child => {
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

  const options = extractOptions(children);

  // Extract placeholder from SelectValue if present
  let placeholder = "Select";
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && child.type === SelectValue) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      placeholder = (child.props as any).placeholder || placeholder;
    }  });  return (
    <select
      className={`flex h-10 w-full rounded-none border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none [-webkit-appearance:none] [background-image:url("data:image/svg+xml;charset=US-ASCII,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")] bg-no-repeat [background-position:right_0.75rem_center] [background-size:16px_12px] pr-10 [border-radius:0!important] [-webkit-border-radius:0!important] ${className || ''}`}
      ref={ref}
      value={internalValue}
      onChange={handleChange}
      disabled={disabled}
      {...props}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {options}    </select>
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