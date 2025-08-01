import * as React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className="mx-auto max-w-[620px] relative">
      {/* Background flou */}



        <div className={`bg-white p-6 pt-8 pb-8 px-10 rounded-[20px] shadow-xl shadow-red-500/50 ${className}`}>
          <div className="mb-3 flex justify-start">
            <img
              src="https://iili.io/3V2HyLx.png"
              alt="Logo"
              width="45"
              height="45"
              className="mb-2"
            />
          </div>
          <div className="text-left">
            {children}
          </div>
          
        </div>
    </div>
  );
};

export default Card; 