import * as React from 'react';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  primary?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  href,
  children,
  className = '',
  target = '_blank',
  primary = true,
}) => {
  const baseStyles = "inline-block px-6 py-3 rounded-lg font-medium text-center no-underline";
  const primaryStyles = "bg-[#02153A] text-white hover:bg-[#2200cc]";
  const secondaryStyles = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  
  const styles = primary ? primaryStyles : secondaryStyles;
  
  return (
    <a
      href={href}
      target={target}
      className={`${baseStyles} ${styles} ${className} font-sans text-base`}
    >
      {children}
    </a>
  );
};

export default Button; 