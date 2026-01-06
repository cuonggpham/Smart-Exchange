import React from "react";

interface VietnamFlagProps {
    size?: number;
    className?: string;
}

const VietnamFlag: React.FC<VietnamFlagProps> = ({ size = 32, className = "" }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Circular clip path */}
            <defs>
                <clipPath id="circle-clip-vn">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
            </defs>

            {/* Red background */}
            <circle cx="16" cy="16" r="16" fill="#DA251D" />

            {/* Yellow star */}
            <g clipPath="url(#circle-clip-vn)">
                <path
                    d="M16 7L17.545 12.382H23.236L18.346 15.764L19.891 21.146L16 17.764L12.109 21.146L13.654 15.764L8.764 12.382H14.455L16 7Z"
                    fill="#FFCD00"
                />
            </g>
        </svg>
    );
};

export default VietnamFlag;
