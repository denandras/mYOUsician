"use client"

import * as React from "react"

// Simple Select wrapper for native select elements with controlled value management
const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    onValueChange?: (value: string) => void
    value?: string
    children?: React.ReactNode
  }
>(({ className, children, onValueChange, onChange, value, disabled, ...props }, ref) => {
  // Use a ref to control the select value directly
  const selectRef = React.useRef<HTMLSelectElement>(null);
  
  // Track if we're in the middle of a user-initiated change
  const isUserChanging = React.useRef(false);
  // Set initial value
  React.useEffect(() => {
    if (selectRef.current && !isUserChanging.current) {
      console.log('SELECT UPDATE - Setting value from prop:', { newValue: value, reason: 'Prop value changed' });
      selectRef.current.value = value ?? '';
    }
  }, [value]);  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    console.log('SELECT UPDATE - User changed selection:', { newValue, reason: 'User interaction' });
    
    // Mark that we're in a user change
    isUserChanging.current = true;
    
    // Call onValueChange for parent state updates
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    // Call original onChange if provided
    if (onChange) {
      onChange(e);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      isUserChanging.current = false;
    }, 50);
  }  // Extract options from nested children (inside SelectContent)
  const extractOptions = (children: React.ReactNode): React.ReactNode[] => {
    const options: React.ReactNode[] = [];
    
    React.Children.forEach(children, child => {
      if (React.isValidElement(child)) {
        if (child.type === SelectContent) {
          // Extract options from SelectContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          React.Children.forEach((child.props as any).children, contentChild => {
            if (React.isValidElement(contentChild)) {
              if (contentChild.type === SelectItem) {
                options.push(contentChild);
              } else if (contentChild.type === SelectGroup) {
                // Handle SelectGroup (optgroup)
                options.push(contentChild);
              }
            }
          });
        } else if (child.type === SelectItem) {
          // Direct SelectItem
          options.push(child);
        } else if (child.type === SelectGroup) {
          // Direct SelectGroup
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
    }
  });

  // Combine refs
  const combinedRef = React.useCallback((element: HTMLSelectElement) => {
    selectRef.current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  }, [ref]);

  return (
    <select
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={combinedRef}
      defaultValue={value ?? ''}
      onChange={handleChange}
      disabled={disabled}
      {...props}
    >
      <option value="" disabled hidden>
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

const SelectGroup = React.forwardRef<
  HTMLOptGroupElement,
  React.OptgroupHTMLAttributes<HTMLOptGroupElement>
>(({ className, children, label, ...props }, ref) => (
  <optgroup
    ref={ref}
    label={label}
    className={className}
    {...props}
  >
    {children}
  </optgroup>
))
SelectGroup.displayName = "SelectGroup"

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
}
