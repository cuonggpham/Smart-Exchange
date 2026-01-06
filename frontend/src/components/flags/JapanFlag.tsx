import React from "react";

interface JapanFlagProps {
    size?: number;
    className?: string;
}

const JapanFlag: React.FC<JapanFlagProps> = ({ size = 32, className = "" }) => {
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
                <clipPath id="circle-clip-jp">
                    <circle cx="16" cy="16" r="16" />
                </clipPath>
            </defs>

            {/* White background */}
            <circle cx="16" cy="16" r="16" fill="#FFFFFF" />

            {/* Red sun disc */}
            <g clipPath="url(#circle-clip-jp)">
                <circle cx="16" cy="16" r="6" fill="#BC002D" />
            </g>
        </svg>
    );
};

export default JapanFlag;
