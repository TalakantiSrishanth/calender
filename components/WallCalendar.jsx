'use client';

import React, { useState, useEffect } from 'react';
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
  parseISO,
  areIntervalsOverlapping,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Helper to get a seasonal image based on month (0-11)
const getMonthImage = (monthIndex) => {
  const seeds = [
    'snow,mountain', // Jan
    'winter,landscape', // Feb
    'spring,flower', // Mar
    'green,hill', // Apr
    'nature,water', // May
    'summer,beach', // Jun
    'ocean,sun', // Jul
    'forest,sunlight', // Aug
    'autumn,leaves', // Sep
    'fall,trees', // Oct
    'frost,nature', // Nov
    'ice,lake', // Dec
  ];
  return `https://picsum.photos/seed/${seeds[monthIndex]}/1200/800`;
};

export default function WallCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [direction, setDirection] = useState(0); // For animation
  const [saveStatus, setSaveStatus] = useState('idle');

  // Load notes from local storage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('calendar_notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNotes(parsed);
        } else {
          // Migrate old format
          const migrated = [];
          for (const [key, text] of Object.entries(parsed)) {
            if (typeof text === 'string' && text.trim()) {
              if (key.includes('_')) {
                const [start, end] = key.split('_');
                migrated.push({ id: Math.random().toString(36).substring(2, 9), startDate: start, endDate: end, text });
              } else {
                migrated.push({ id: Math.random().toString(36).substring(2, 9), startDate: key, endDate: key, text });
              }
            }
          }
          setNotes(migrated);
        }
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save notes to local storage when they change
  useEffect(() => {
    if (isLoaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaveStatus('saving');
      const timeout = setTimeout(() => {
        const cleanedNotes = notes.filter(n => n.text.trim() !== '');
        if (cleanedNotes.length !== notes.length) {
           setNotes(cleanedNotes);
        }
        localStorage.setItem('calendar_notes', JSON.stringify(cleanedNotes));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [notes, isLoaded]);

  const nextMonth = () => {
    setDirection(1);
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setDirection(-1);
    setCurrentDate(subMonths(currentDate, 1));
  };

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

  const onDateHover = (day) => {
    if (startDate && !endDate) {
      setHoverDate(day);
    } else {
      setHoverDate(null);
    }
  };

  const currentMonthKey = format(currentDate, 'yyyy-MM');
  const selectedStartStr = startDate ? format(startDate, 'yyyy-MM-dd') : currentMonthKey;
  const selectedEndStr = startDate ? (endDate ? format(endDate, 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')) : currentMonthKey;

  const exactMatchNote = notes.find(n => n.startDate === selectedStartStr && n.endDate === selectedEndStr);

  const overlappingNotes = notes.filter(n => {
    if (n.id === exactMatchNote?.id) return false;
    if (!n.text || n.text.trim() === '') return false;
    if (!startDate) return n.startDate === currentMonthKey; // General month notes
    if (n.startDate.length === 7) return false; // Skip general month notes when a date is selected

    try {
      const nStart = parseISO(n.startDate);
      const nEnd = parseISO(n.endDate);
      const sStart = startDate;
      const sEnd = endDate || startDate;

      return areIntervalsOverlapping(
        { start: nStart, end: nEnd },
        { start: sStart, end: sEnd },
        { inclusive: true }
      );
    } catch (e) {
      return false;
    }
  });

  const handleExactMatchChange = (e) => {
    const text = e.target.value;
    if (exactMatchNote) {
      setNotes(prev => prev.map(n => n.id === exactMatchNote.id ? { ...n, text } : n));
    } else {
      if (text.trim() === '') return;
      const newNote = {
        id: Math.random().toString(36).substring(2, 9),
        startDate: selectedStartStr,
        endDate: selectedEndStr,
        text
      };
      setNotes(prev => [...prev, newNote]);
    }
  };

  const handleUpdateNote = (id, newText) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, text: newText } : n));
  };

  const handleDeleteNote = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const renderHeader = () => {
    return (
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
    );
  };

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
    
    // Calculate total days to render
    const totalDays = Math.round((endDateOfWeek.getTime() - startDateOfWeek.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const currentLoopDate = addDays(startDateOfWeek, i);
      const formattedDate = format(currentLoopDate, 'd');
      const cloneDay = currentLoopDate;
      const dayKey = format(currentLoopDate, 'yyyy-MM-dd');

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

      // Check if this day has a note
      const hasNote = notes.some(n => {
        if (n.startDate.length === 7) return false;
        if (!n.text || n.text.trim() === '') return false;
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
          
          {/* Note Indicator Dot */}
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

  const monthIndex = currentDate.getMonth();

  const variants = {
    enter: (direction) => {
      return {
        x: direction > 0 ? 50 : -50,
        opacity: 0,
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 50 : -50,
        opacity: 0,
      };
    },
  };

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
        
        {/* Hero Section */}
        <div className="relative h-48 sm:h-64 md:h-80 w-full overflow-hidden bg-gray-900 flex-shrink-0">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentDate.toString()}
              custom={direction}
              variants={variants}
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
              {/* Smooth Gradient Overlay (Bottom Up) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
              
              {/* Text Container */}
              <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-left z-10">
                <div className="text-4xl sm:text-6xl font-bold tracking-tight leading-none text-white drop-shadow-md">{format(currentDate, 'MMMM')}</div>
                <div className="text-xl sm:text-2xl font-medium text-white/80 mt-1 sm:mt-2 drop-shadow-md">{format(currentDate, 'yyyy')}</div>
              </div>
            </motion.div>
          </AnimatePresence>
          {renderHeader()}
        </div>

        {/* Bottom Section: Notes & Grid */}
        <div className="flex flex-col md:flex-row w-full bg-white relative z-10">
          
          {/* Notes Section */}
          <div className="w-full md:w-1/3 p-6 sm:p-8 bg-gray-50/50 flex flex-col relative border-b md:border-b-0 md:border-r border-gray-100">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Notes</h3>
                <div className="h-4 flex items-center">
                  {saveStatus === 'saved' && <span className="text-xs text-emerald-500 font-medium flex items-center gap-1"><Check className="w-3 h-3"/> Saved</span>}
                  {saveStatus === 'saving' && <span className="text-xs text-gray-400 font-medium">Saving...</span>}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                  {startDate
                    ? endDate
                      ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`
                      : format(startDate, 'MMM d, yyyy')
                    : `${format(currentDate, 'MMMM yyyy')}`}
                  
                  {(overlappingNotes.length > 0 || (exactMatchNote && exactMatchNote.text.trim())) && (
                    <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full font-medium whitespace-nowrap">
                      {overlappingNotes.length + (exactMatchNote && exactMatchNote.text.trim() ? 1 : 0)} note{(overlappingNotes.length + (exactMatchNote && exactMatchNote.text.trim() ? 1 : 0)) !== 1 ? 's' : ''}
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{startDate ? 'Selected Range' : 'General Notes'}</p>
              </div>

              <div className="flex-grow flex flex-col overflow-y-auto pr-3 -mr-3 custom-scrollbar">
                {overlappingNotes.length > 0 && (
                  <div className="mb-6 space-y-4">
                    {overlappingNotes.map(note => (
                      <div key={note.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-200 relative group">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">
                            {note.startDate === note.endDate 
                              ? format(parseISO(note.startDate), 'MMM d, yyyy') 
                              : `${format(parseISO(note.startDate), 'MMM d')} - ${format(parseISO(note.endDate), 'MMM d')}`}
                          </span>
                          <button 
                            onClick={() => handleDeleteNote(note.id)} 
                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete note"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={note.text}
                          onChange={(e) => handleUpdateNote(note.id, e.target.value)}
                          className="w-full bg-transparent resize-none focus:outline-none text-gray-700 text-sm leading-relaxed"
                          rows={Math.max(1, note.text.split('\n').length)}
                        />
                      </div>
                    ))}
                    
                    <div className="flex items-center gap-3 py-2">
                      <div className="h-px bg-gray-200 flex-grow"></div>
                      <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Current Selection</span>
                      <div className="h-px bg-gray-200 flex-grow"></div>
                    </div>
                  </div>
                )}

                <div className="relative flex-grow min-h-[150px]">
                  {/* Lined paper background effect */}
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #f3f4f6 31px, #f3f4f6 32px)', backgroundAttachment: 'local' }}></div>
                  <textarea
                    value={exactMatchNote ? exactMatchNote.text : ''}
                    onChange={handleExactMatchChange}
                    placeholder={overlappingNotes.length > 0 ? "Add another note for this specific selection..." : "Write your notes here..."}
                    className="w-full h-full bg-transparent resize-none focus:outline-none text-gray-700 leading-[32px] pt-1 relative z-10"
                    style={{ lineHeight: '32px' }}
                  />
                </div>
              </div>
              
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
