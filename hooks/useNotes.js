import { useState, useEffect } from 'react';
import { format, parseISO, areIntervalsOverlapping } from 'date-fns';

export function useNotes({ currentDate, startDate, endDate }) {
  const [notes, setNotes] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');

  useEffect(() => {
    const savedNotes = localStorage.getItem('calendar_notes');
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNotes(parsed);
        } else {
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

  const currentMonthKey = format(currentDate, 'yyyy-MM');
  const selectedStartStr = startDate ? format(startDate, 'yyyy-MM-dd') : currentMonthKey;
  const selectedEndStr = startDate ? (endDate ? format(endDate, 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd')) : currentMonthKey;

  const exactMatchNote = notes.find(n => n.startDate === selectedStartStr && n.endDate === selectedEndStr);

  const overlappingNotes = notes.filter(n => {
    if (n.id === exactMatchNote?.id) return false;
    if (!startDate) return n.startDate === currentMonthKey;
    if (n.startDate.length === 7) return false;

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

  return {
    notes,
    saveStatus,
    exactMatchNote,
    overlappingNotes,
    handleExactMatchChange,
    handleUpdateNote,
    handleDeleteNote
  };
}
