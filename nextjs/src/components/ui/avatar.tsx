import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  forename?: string | null;
  surname?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  title?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-20 w-20 text-xl'
};

export function Avatar({ 
  forename, 
  surname, 
  size = 'md', 
  className, 
  onClick,
  title 
}: AvatarProps) {
  // Generate initials from first letter of forename and surname
  const getInitials = (first?: string | null, last?: string | null): string => {
    const firstInitial = first && first.trim() ? first.trim()[0].toUpperCase() : '';
    const lastInitial = last && last.trim() ? last.trim()[0].toUpperCase() : '';
    
    if (firstInitial && lastInitial) {
      return firstInitial + lastInitial;
    } else if (firstInitial) {
      return firstInitial;
    } else if (lastInitial) {
      return lastInitial;
    }
    return '?';
  };

  const initials = getInitials(forename, surname);
  
  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold cursor-pointer hover:bg-primary/20 transition-colors',
        sizeClasses[size],
        onClick ? 'cursor-pointer' : 'cursor-default',
        className
      )}
      onClick={onClick}
      title={title}
    >
      {initials}
    </div>
  );
}
