import React from "react";
import Calendar from "react-calendar";
import { motion, AnimatePresence } from "framer-motion";
import "react-calendar/dist/Calendar.css";

const CalendarDrawer = ({ showCalendar, setShowCalendar, selectedDate, setSelectedDate }) => {
  return (
    <AnimatePresence>
      {showCalendar && (
        <motion.div
          className="calendar-drawer"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Calendar
            onChange={(date) => {
              setSelectedDate(date);
              setShowCalendar(false);
            }}
            value={selectedDate}
            maxDate={new Date()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CalendarDrawer;