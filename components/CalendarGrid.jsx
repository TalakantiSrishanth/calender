import React from 'react';
import {
  format,
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
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarGrid({
  currentDate,
  startDate,
  endDate,
  hoverDate,
  notes,
  onDateClick,
  onDateHover
}) {
  const renderDays = () => {
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
  };

  const renderCells = () => {
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

      const isSelectedStart = startDate && isSameDay(currentLoopDate, startDate);
      const isSelectedEnd = endDate && isSameDay(currentLoopDate, endDate);
      const isWithinSelection =
        startDate && endDate && isWithinInterval(currentLoopDate, { start: startDate, end: endDate });
      const isHoverRange =
        startDate &&
        !endDate &&
        hoverDate &&
        ((isAfter(currentLoopDate, startDate) && isBefore(currentLoopDate, hoverDate)) ||
          (isBefore(currentLoopDate, startDate) && isAfter(currentLoopDate, hoverDate)) ||
          isSameDay(currentLoopDate, hoverDate));

      const isCurrentMonth = isSameMonth(currentLoopDate, monthStart);
      const isToday = isSameDay(currentLoopDate, new Date());

      const hasNote = notes.some(n => {
        if (n.startDate.length === 7) return false;
        try {
          const nStart = parseISO(n.startDate);
          const nEnd = parseISO(n.endDate);
          return currentLoopDate >= nStart && currentLoopDate <= nEnd;
        } catch (e) {
          return false;
        }
      });

      days.push(
        <div
          key={currentLoopDate.toString()}
          className={cn(
            'relative flex flex-col items-center justify-center h-12 sm:h-14 cursor-pointer transition-all duration-200 group',
            !isCurrentMonth ? 'text-gray-300' : 'text-gray-700',
          )}
          onClick={() => onDateClick(cloneDay)}
          onMouseEnter={() => onDateHover(cloneDay)}
        >
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
          
          {hasNote && (
            <div className={cn(
              "absolute bottom-1 sm:bottom-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full z-10 transition-colors",
              isSelectedStart || isSelectedEnd ? "bg-white" : "bg-blue-400"
            )} />
          )}
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
  };

  return (
    <div className="w-full md:w-2/3 p-6 sm:p-10">
      {renderDays()}
      {renderCells()}
    </div>
  );
}
