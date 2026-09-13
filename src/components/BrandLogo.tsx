import React from "react";

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} flex-shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer loop of the "2" / "S" track */}
      <path
        d="M 32,42 C 32,32 72,22 72,40 C 72,55 35,53 35,70 C 35,80 50,82 66,74"
        stroke="#D4F636"
        strokeWidth="15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrowhead pointing parallel to the upward diagonal track */}
      <path
        d="M 58,82 L 76,74 L 68,56"
        stroke="#D4F636"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
