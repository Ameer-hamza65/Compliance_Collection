import { ReactNode } from 'react';

interface SlideLayoutProps {
  children: ReactNode;
  className?: string;
}

export function SlideLayout({ children, className = '' }: SlideLayoutProps) {
  return (
    <div className={`w-[1920px] h-[1080px] relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
