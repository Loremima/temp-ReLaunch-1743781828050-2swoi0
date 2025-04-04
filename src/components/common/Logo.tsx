import React from 'react';
import { Rocket } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Rocket className={`${size === 'sm' ? 'h-6 w-6' :
        size === 'md' ? 'h-8 w-8' :
          'h-10 w-10'
        } text-blue-600`} />
      {size !== 'sm' && (
        <span className={`ml-2 font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent ${sizes[size]}`}>
          ReLaunch
        </span>
      )}
    </div>
  );
}