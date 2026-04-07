export const SkylabOriginalLogo: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
            >
                {/* 
                    Perfect matching geometry:
                    The tail points directly to the bottom left.
                    The bubble pushes towards the top right.
                */}
                <path
                    d="M 60 5 C 90 5 110 25 110 50 C 110 75 85 90 60 90 C 50 90 45 88 40 85 L 15 100 L 25 80 C 10 65 10 55 10 50 C 10 25 30 5 60 5 Z"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    className="text-white"
                />
                
                {/* 3 Cyan Dots */}
                <circle cx="80" cy="30" r="7" fill="#0EA5E9" />
                <circle cx="60" cy="50" r="7" fill="#0EA5E9" />
                <circle cx="40" cy="70" r="7" fill="#0EA5E9" />
            </svg>
        </div>
    );
};
