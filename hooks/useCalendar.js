import { useState } from 'react';
import { addMonths, subMonths, isBefore } from 'date-fns';

export function useCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [direction, setDirection] = useState(0);

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

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return {
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
  };
}
