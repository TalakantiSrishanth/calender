import React from 'react';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';

const getMonthImage = (monthIndex) => {
  const seeds = [
    'snow,mountain',
    'winter,landscape',
    'spring,flower',
    'green,hill',
    'nature,water',
    'summer,beach',
    'ocean,sun',
    'forest,sunlight',
    'autumn,leaves',
    'fall,trees',
    'frost,nature',
    'ice,lake',
  ];
  return `https://picsum.photos/seed/${seeds[monthIndex]}/1200/800`;
};

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

export default function CalendarHeader({ currentDate, direction, prevMonth, nextMonth }) {
  const monthIndex = currentDate.getMonth();

  return (
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
          
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 text-left z-10">
            <div className="text-4xl sm:text-6xl font-bold tracking-tight leading-none text-white drop-shadow-md">{format(currentDate, 'MMMM')}</div>
            <div className="text-xl sm:text-2xl font-medium text-white/80 mt-1 sm:mt-2 drop-shadow-md">{format(currentDate, 'yyyy')}</div>
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
  );
}
