import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createEvent, updateEvent } from '../redux/slices/eventsSlice';

const EventModal = ({ show, handleClose, mode, event, slot, onDelete }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('exercise');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  useEffect(() => {
    if (mode === 'view' && event) {
      setTitle(event.title);
      setCategory(event.category);
      setStartTime(new Date(event.start));
      setEndTime(new Date(event.end));
    } else if (mode === 'create' && slot) {
      setStartTime(new Date(slot.start));
      setEndTime(new Date(slot.end));
    }
  }, [mode, event, slot]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      title,
      category,
      start: startTime,
      end: endTime
    };

    if (mode === 'view' && event) {
      dispatch(updateEvent({
        id: event._id,
        eventData
      }));
    } else {
      dispatch(createEvent(eventData));
    }
    
    handleClose();
  };

  const handleDelete = () => {
    if (event && event._id) {
      onDelete(event._id);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{mode === 'create' ? '+ Create New Event' : 'Edit Event'}</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <span style={{ display: 'inline-block', marginRight: '8px' }}>🏷️</span>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <span style={{ display: 'inline-block', marginRight: '8px' }}>🗂️</span>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="exercise">Exercise</option>
              <option value="eating">Eating</option>
              <option value="work">Work</option>
              <option value="relax">Relax</option>
              <option value="family">Family</option>
              <option value="social">Social</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>
              <span style={{ display: 'inline-block', marginRight: '8px' }}>📅</span>
              Start Time
            </label>
            <DatePicker
              selected={startTime}
              onChange={date => setStartTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MM/dd/yyyy hh:mm aa"
              className="date-picker"
              required
            />
          </div>
          
          <div className="form-group">
            <label>
              <span style={{ display: 'inline-block', marginRight: '8px' }}>⏱️</span>
              End Time
            </label>
            <DatePicker
              selected={endTime}
              onChange={date => setEndTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MM/dd/yyyy hh:mm aa"
              className="date-picker"
              required
              minDate={startTime}
              minTime={startTime}
              maxTime={new Date(startTime).setHours(23, 59)}
            />
          </div>
          
          <div className="modal-actions">
            {mode === 'view' && (
              <button
                type="button"
                className="delete-button"
                onClick={handleDelete}
              >
                Delete
              </button>
            )}
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              {mode === 'create' ? 'Create Event' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
