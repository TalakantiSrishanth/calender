'use client';

import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isWithinInterval,
  isBefore,
  isAfter,
} from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const getMonthImage = (monthIndex) => {
  const seeds = [
    'snow,mountain', 'winter,landscape', 'spring,flower', 'green,hill',
    'nature,water', 'summer,beach', 'ocean,sun', 'forest,sunlight',
    'autumn,leaves', 'fall,trees', 'frost,nature', 'ice,lake',
  ];
  return `https://picsum.photos/seed/${seeds[monthIndex]}/1200/800`;
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  
  // New state for date selection
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Handle clicking on a date
  const onDateClick = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  // Handle hovering over a date for range preview
  const onDateHover = (day) => {
    if (startDate && !endDate) {
      setHoverDate(day);
    } else {
      setHoverDate(null);
    }
  };

  const monthIndex = currentDate.getMonth();

  function renderDays() {
    const days = [];
    const startDateOfWeek = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-xs text-gray-400 uppercase tracking-widest py-4">
          {format(addDays(startDateOfWeek, i), 'EEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  }

  function renderCells() {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDateOfWeek = startOfWeek(monthStart);
    const endDateOfWeek = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    
    const totalDays = Math.round((endDateOfWeek.getTime() - startDateOfWeek.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentLoopDate = addDays(startDateOfWeek, i);
      const formattedDate = format(currentLoopDate, 'd');
      const cloneDay = currentLoopDate;

      const isCurrentMonth = isSameMonth(currentLoopDate, monthStart);
      const isToday = isSameDay(currentLoopDate, new Date());

      // Selection logic checks
      const isSelectedStart = startDate && isSameDay(currentLoopDate, startDate);
      const isSelectedEnd = endDate && isSameDay(currentLoopDate, endDate);
      const isWithinSelection = startDate && endDate && isWithinInterval(currentLoopDate, { start: startDate, end: endDate });
      const isHoverRange = startDate && !endDate && hoverDate && (
        (isAfter(currentLoopDate, startDate) && isBefore(currentLoopDate, hoverDate)) ||
        (isBefore(currentLoopDate, startDate) && isAfter(currentLoopDate, hoverDate)) ||
        isSameDay(currentLoopDate, hoverDate)
      );

      days.push(
        <div
          key={currentLoopDate.toString()}
          className={cn(
            'relative flex flex-col items-center justify-center h-12 sm:h-14 cursor-pointer transition-all duration-200 group',
            !isCurrentMonth ? 'text-gray-300' : 'text-gray-700'
          )}
          onClick={() => onDateClick(cloneDay)}
          onMouseEnter={() => onDateHover(cloneDay)}
        >
          {/* Background highlight for range */}
          {(isWithinSelection || isHoverRange) && !isSelectedStart && !isSelectedEnd && (
            <div className="absolute inset-0 bg-blue-50/80 my-1" />
          )}
          {isSelectedStart && (endDate || hoverDate) && isBefore(startDate, endDate || hoverDate) && (
            <div className="absolute right-0 top-1 bottom-1 w-1/2 bg-blue-50/80" />
          )}
          {isSelectedEnd && startDate && isAfter(endDate, startDate) && (
            <div className="absolute left-0 top-1 bottom-1 w-1/2 bg-blue-50/80" />
          )}

          <span
            className={cn(
              'relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full z-10 transition-all duration-200',
              isSelectedStart || isSelectedEnd ? 'bg-blue-600 text-white shadow-md scale-105' : 'group-hover:bg-gray-100',
              isToday && !isSelectedStart && !isSelectedEnd ? 'ring-2 ring-blue-600 ring-offset-2 text-blue-600 font-semibold' : '',
              (isWithinSelection || isHoverRange) && !isSelectedStart && !isSelectedEnd ? 'group-hover:bg-blue-100/80' : ''
            )}
          >
            {formattedDate}
          </span>
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div className="grid grid-cols-7 gap-y-1" key={`row-${i / 7}`}>
            {days}
          </div>
        );
        days = [];
      }
    }
    return <div className="flex flex-col">{rows}</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans">
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden w-full max-w-5xl border border-gray-100 flex flex-col relative">
        
        {/* Hero Section */}
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-gray-900 flex-shrink-0">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentDate.toString()}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.3 },
              }}
              className="absolute inset-0"
            >
              <Image
                src={getMonthImage(monthIndex)}
                alt={`Calendar image for ${format(currentDate, 'MMMM')}`}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
              
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-left z-10">
                <div className="text-4xl sm:text-6xl font-bold tracking-tight leading-none text-white drop-shadow-md">
                  {format(currentDate, 'MMMM')}
                </div>
                <div className="text-xl sm:text-2xl font-medium text-white/80 mt-1 sm:mt-2 drop-shadow-md">
                  {format(currentDate, 'yyyy')}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 flex gap-2 sm:gap-3 z-20">
            <button
              onClick={prevMonth}
              className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white border border-white/10"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all text-white border border-white/10"
              aria-label="Next Month"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Bottom Section: Notes & Grid */}
        <div className="flex flex-col md:flex-row w-full bg-white relative z-10">
          
          {/* Notes Section */}
          <div className="w-full md:w-1/3 p-6 sm:p-8 bg-gray-50/50 flex flex-col relative border-b md:border-b-0 md:border-r border-gray-100">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col h-full">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Notes</h3>
               
               <div className="mb-6">
                 <h4 className="text-lg font-semibold text-gray-900">
                   {startDate
                     ? endDate
                       ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
                       : format(startDate, 'MMM d, yyyy')
                     : `${format(currentDate, 'MMMM yyyy')}`}
                 </h4>
                 <p className="text-sm text-gray-500 mt-1">
                   {startDate ? 'Selected Range' : 'General Notes'}
                 </p>
               </div>

               <p className="text-sm text-gray-500 flex-grow">Notes feature coming in the next step...</p>

               {/* Clear Selection Button */}
               <AnimatePresence>
                 {(startDate || endDate) && (
                   <motion.button 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: 10 }}
                     onClick={() => { setStartDate(null); setEndDate(null); }}
                     className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex items-center justify-center gap-2"
                   >
                     <X className="w-4 h-4" /> Clear Selection
                   </motion.button>
                 )}
               </AnimatePresence>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="w-full md:w-2/3 p-6 sm:p-10">
            {renderDays()}
            {renderCells()}
          </div>

        </div>
      </div>
    </div>
  );
}