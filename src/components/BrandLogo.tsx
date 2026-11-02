import React from "react";

interface BrandLogoProps {
  className?: string;
  alt?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "w-10 h-10", 
  alt = "Skill2Bills Logo" 
}) => {
  return (
    <img
      src="/brand-logo.jpg"
      alt={alt}
      referrerPolicy="no-referrer"
      className={`${className} flex-shrink-0 object-cover rounded-xl shadow-sm select-none`}
    />
  );
};
