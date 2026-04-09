import React from 'react';

export default function SpiralBinding() {
  return (
    <div className="flex justify-center space-x-4 sm:space-x-8 mb-[-16px] z-20 relative px-8 w-full max-w-5xl pointer-events-none">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          {/* The wire loop */}
          <div className="w-2.5 h-10 sm:w-3.5 sm:h-12 bg-gradient-to-b from-gray-200 via-white to-gray-300 rounded-full border border-gray-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.1)] transform -rotate-6"></div>
          {/* The hole in the paper */}
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-800 rounded-full mt-[-8px] sm:mt-[-10px] shadow-inner opacity-40"></div>
        </div>
      ))}
    </div>
  );
}
