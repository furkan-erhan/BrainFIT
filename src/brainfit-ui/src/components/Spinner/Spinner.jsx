import React from 'react';

const Spinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex justify-center items-center py-4">
            <div
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary rounded-full animate-spin`}
                role="status"
            >
                <span className="sr-only">Loading...</span>
            </div>
        </div>
    );
};

export default Spinner;
