'use client';

import React from 'react';
import { useCalendar } from '../hooks/useCalendar';
import { useNotes } from '../hooks/useNotes';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import CalendarGrid from './CalendarGrid';

export default function WallCalendar() {
  const {
    currentDate,
    startDate,
    endDate,
    hoverDate,
    direction,
    nextMonth,
    prevMonth,
    onDateClick,
    onDateHover,
    clearSelection
  } = useCalendar();

  const {
    notes,
    saveStatus,
    exactMatchNote,
    overlappingNotes,
    handleExactMatchChange,
    handleUpdateNote,
    handleDeleteNote
  } = useNotes({ currentDate, startDate, endDate });

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
        }
      `}</style>

      {/* Spiral Binding Visual */}
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

      {/* Calendar Card */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden w-full max-w-5xl border border-gray-100 flex flex-col relative">
        
        <CalendarHeader 
          currentDate={currentDate} 
          direction={direction} 
          prevMonth={prevMonth} 
          nextMonth={nextMonth} 
        />

        {/* Bottom Section: Notes & Grid */}
        <div className="flex flex-col md:flex-row w-full bg-white relative z-10">
          
          <CalendarSidebar 
            currentDate={currentDate}
            startDate={startDate}
            endDate={endDate}
            saveStatus={saveStatus}
            exactMatchNote={exactMatchNote}
            overlappingNotes={overlappingNotes}
            handleExactMatchChange={handleExactMatchChange}
            handleUpdateNote={handleUpdateNote}
            handleDeleteNote={handleDeleteNote}
            clearSelection={clearSelection}
          />

          <CalendarGrid 
            currentDate={currentDate}
            startDate={startDate}
            endDate={endDate}
            hoverDate={hoverDate}
            notes={notes}
            onDateClick={onDateClick}
            onDateHover={onDateHover}
          />

        </div>
      </div>
    </div>
  );
}
