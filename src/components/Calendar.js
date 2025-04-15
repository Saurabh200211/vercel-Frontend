import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { fetchEvents, updateEvent, deleteEvent, createEvent } from '../redux/slices/eventsSlice';
import EventModal from './EventModal';

const localizer = momentLocalizer(moment);

// Custom event component to format events like in the reference image
const EventComponent = ({ event }) => {
  const time = moment(event.start).format('h:mm A');
  
  // Add a small circle indicator based on event category
  const getIndicator = () => {
    if (event.category === 'eating') return '■';
    if (event.category === 'social') return '★';
    if (event.category === 'relax') return '◆';
    return '●';
  };
  
  return (
    <div>
      <div className="rbc-event-label">{time} {getIndicator()}</div>
      <div className="rbc-event-content">{event.title}</div>
    </div>
  );
};

// Custom day header component to show day number and day name
const DayHeaderComponent = ({ date }) => {
  const dayNumber = moment(date).format('D');
  const dayName = moment(date).format('ddd').toUpperCase();
  
  return (
    <div className="custom-day-header">
      <div className="day-name">{dayName}</div>
      <div className="day-number">{dayNumber}</div>
    </div>
  );
};

// Custom toolbar component
const CustomToolbar = ({ date, onNavigate, onView, view }) => {
  const goToToday = () => {
    onNavigate('TODAY');
  };

  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToDay = () => {
    onView('day');
  };

  const goToWeek = () => {
    onView('week');
  };

  const goToMonth = () => {
    onView('month');
  };

  const goToYear = () => {
    onView('agenda');
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (view === 'week') {
      const start = moment(date).startOf('week');
      const end = moment(date).endOf('week');
      return `${start.format('MMMM D')} - ${end.format('D, YYYY')}`;
    } else if (view === 'day') {
      return moment(date).format('MMMM D, YYYY');
    } else if (view === 'month') {
      return moment(date).format('MMMM YYYY');
    } else {
      return moment(date).format('YYYY');
    }
  };

  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={goToToday}>Today</button>
        <button type="button" onClick={goToBack}>&lt;</button>
        <button type="button" onClick={goToNext}>&gt;</button>
      </div>
      <span className="rbc-toolbar-label">{formatDateRange()}</span>
      <div className="rbc-btn-group">
        <button 
          type="button" 
          onClick={goToDay}
          className={view === 'day' ? 'rbc-active' : ''}
        >
          Day
        </button>
        <button 
          type="button" 
          onClick={goToWeek}
          className={view === 'week' ? 'rbc-active' : ''}
        >
          Week
        </button>
        <button 
          type="button" 
          onClick={goToMonth}
          className={view === 'month' ? 'rbc-active' : ''}
        >
          Month
        </button>
        <button 
          type="button" 
          onClick={goToYear}
          className={view === 'agenda' ? 'rbc-active' : ''}
        >
          Year
        </button>
      </div>
    </div>
  );
};

const Calendar = () => {
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.events);
  const { goals } = useSelector((state) => state.goals);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [view, setView] = useState('week');
  // Set the initial date to April 21, 2025 to match the seed data
  const [date, setDate] = useState(new Date(2025, 3, 21));
  const calendarRef = useRef(null);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    // Add event listeners for drag and drop
    const calendarElement = calendarRef.current;
    if (calendarElement) {
      calendarElement.addEventListener('dragover', handleDragOver);
      calendarElement.addEventListener('drop', handleDrop);
    }

    return () => {
      // Clean up event listeners
      if (calendarElement) {
        calendarElement.removeEventListener('dragover', handleDragOver);
        calendarElement.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    try {
      // Get the task data from the drag event
      const taskData = JSON.parse(e.dataTransfer.getData('task'));
      
      if (taskData) {
        // Calculate the drop time based on the mouse position
        const calendarRect = e.currentTarget.getBoundingClientRect();
        const mouseY = e.clientY - calendarRect.top;
        const calendarHeight = calendarRect.height;
        
        // Estimate the time based on position (simplified)
        const now = new Date();
        const hours = Math.floor((mouseY / calendarHeight) * 12) + 8; // 8am to 8pm range
        const minutes = Math.round(((mouseY / calendarHeight) * 12 % 1) * 60 / 15) * 15;
        
        const start = new Date(now);
        start.setHours(hours, minutes, 0, 0);
        
        // Set end time 30 minutes later
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 30);
        
        // Create event from task
        const eventData = {
          title: taskData.name,
          category: 'work', // Default category
          start,
          end,
          taskId: taskData._id,
          goalId: taskData.goalId
        };
        
        dispatch(createEvent(eventData));
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleSelectSlot = ({ start, end }) => {
    setSelectedSlot({ start, end });
    setModalMode('create');
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setModalMode('view');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  const handleEventDrop = ({ event, start, end }) => {
    dispatch(updateEvent({
      id: event._id,
      eventData: {
        ...event,
        start,
        end
      }
    }));
  };

  const handleEventResize = ({ event, start, end }) => {
    dispatch(updateEvent({
      id: event._id,
      eventData: {
        ...event,
        start,
        end
      }
    }));
  };

  const handleDeleteEvent = (eventId) => {
    dispatch(deleteEvent(eventId));
    handleCloseModal();
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  // Function to get event style based on category
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3498db'; // Default blue for work events
    
    // If the event has a goalId, use the goal's color
    if (event.goalId) {
      const goal = goals.find(g => g._id === event.goalId);
      if (goal) {
        backgroundColor = goal.color;
      }
    } else {
      // Otherwise, use colors based on category
      switch (event.category) {
        case 'exercise':
          backgroundColor = '#2ecc71'; // Green
          break;
        case 'eating':
          backgroundColor = '#e67e22'; // Orange
          break;
        case 'work':
          backgroundColor = '#3498db'; // Blue
          break;
        case 'relax':
          backgroundColor = '#9b59b6'; // Purple
          break;
        case 'family':
          backgroundColor = '#e74c3c'; // Red
          break;
        case 'social':
          backgroundColor = '#f1c40f'; // Yellow
          break;
        default:
          backgroundColor = '#3498db'; // Default blue
      }
    }

    return {
      className: `event-${event.category}`,
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Custom time slot formatter to match the reference image
  const timeGutterFormat = (date, culture, localizer) => {
    return localizer.format(date, 'h A', culture);
  };

  // Custom formats for the calendar
  const formats = {
    timeGutterFormat: timeGutterFormat,
    dayFormat: 'ddd',
    dayHeaderFormat: (date) => {
      return moment(date).format('ddd D');
    }
  };

  return (
    <div className="calendar-wrapper" ref={calendarRef}>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 'calc(100vh - 80px)' }}
        selectable
        resizable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        components={{
          toolbar: CustomToolbar,
          event: EventComponent,
          header: DayHeaderComponent
        }}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="week"
        step={15}
        timeslots={4}
        titleAccessor="title"
        showMultiDayTimes
        dayLayoutAlgorithm="no-overlap"
        formats={formats}
        min={new Date(0, 0, 0, 7, 0)} // Start at 7 AM
        max={new Date(0, 0, 0, 19, 0)} // End at 7 PM
      />
      
      {showModal && (
        <EventModal
          show={showModal}
          handleClose={handleCloseModal}
          mode={modalMode}
          event={selectedEvent}
          slot={selectedSlot}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default Calendar;
