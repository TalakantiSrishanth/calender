import React from 'react';
import { format, parseISO } from 'date-fns';
import { Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CalendarSidebar({
  currentDate,
  startDate,
  endDate,
  saveStatus,
  exactMatchNote,
  overlappingNotes,
  handleExactMatchChange,
  handleUpdateNote,
  handleDeleteNote,
  clearSelection
}) {
  return (
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
        
        <AnimatePresence>
          {(startDate || endDate) && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={clearSelection}
              className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Clear Selection
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
