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
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// -------- Image Helper --------
const getMonthImage = (monthIndex) => {
  const seeds = [
    'snow-mountain',
    'winter-landscape',
    'spring-flower',
    'green-hill',
    'nature-water',
    'summer-beach',
    'ocean-sun',
    'forest-sunlight',
    'autumn-leaves',
    'fall-trees',
    'frost-nature',
    'ice-lake',
  ];
  return `https://picsum.photos/seed/${seeds[monthIndex]}/1200/800`;
};

// -------- Animation --------
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);

  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

  const monthIndex = currentDate.getMonth();

  // -------- Days Header --------
  function renderDays() {
    const days = [];
    const start = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-center text-xs font-medium text-gray-400 uppercase tracking-widest py-3"
        >
          {format(addDays(start, i), 'EEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7">{days}</div>;
  }

  // -------- Calendar Cells --------
  function renderCells() {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];

    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={cn(
              'flex items-center justify-center h-12 sm:h-14 transition-all duration-200',
              !isCurrentMonth && 'text-gray-300'
            )}
          >
            <span
              className={cn(
                'w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-gray-100',
                isToday &&
                  'ring-2 ring-blue-600 ring-offset-2 text-blue-600 font-semibold'
              )}
            >
              {format(cloneDay, 'd')}
            </span>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return <div>{rows}</div>;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden w-full max-w-5xl border border-gray-100">

        {/* -------- HERO -------- */}
        <div className="relative h-56 sm:h-72 md:h-80 w-full overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentDate.toString()}
              variants={slideVariants}
              custom={direction}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={getMonthImage(monthIndex)}
                alt="calendar"
                fill
                className="object-cover object-center"
                priority
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute bottom-6 left-6 text-white">
                <h1 className="text-4xl sm:text-6xl font-bold">
                  {format(currentDate, 'MMMM')}
                </h1>
                <p className="text-lg opacity-80">
                  {format(currentDate, 'yyyy')}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* NAV */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            <button
              onClick={prevMonth}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={nextMonth}
              className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20"
            >
              <ChevronRight />
            </button>
          </div>
        </div>

        {/* -------- CONTENT -------- */}
        <div className="flex flex-col md:flex-row">

          {/* NOTES */}
          <div className="md:w-1/3 p-6 bg-gray-50 border-r border-gray-100">
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-4">
                Notes
              </h3>
              <p className="text-sm text-gray-500">
                Notes feature coming soon...
              </p>
            </div>
          </div>

          {/* CALENDAR */}
          <div className="md:w-2/3 p-6">
            {renderDays()}
            {renderCells()}
          </div>

        </div>
      </div>
    </div>
  );
}