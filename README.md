# Calendar Application

A Google Calendar-like application built with React, Redux, and MongoDB.

## Features

- Interactive calendar with day, week, and month views
- Create, edit, and delete events
- Drag and drop events to reschedule
- Resize events to change duration
- Categorize events (exercise, eating, work, relax, family, social)
- Goals and tasks sidebar
- Drag and drop tasks to create events

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd calendar-app
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
cd ..
```

### 4. Configure MongoDB

Make sure MongoDB is running locally or update the `.env` file in the server directory with your MongoDB connection string:

```
MONGO_URI=mongodb://localhost:27017/calendar-app
PORT=5000
```

## Running the Application

### 1. Start the backend server

```bash
cd server
npm start
```

This will start the backend server on port 5000.

### 2. Start the frontend application (in a new terminal)

```bash
npm start
```

This will start the React application on port 3000. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Usage

1. The calendar will display in week view by default
2. Click on any time slot to create a new event
3. Fill in the event details (title, category, start/end time)
4. Drag events to move them to different times/days
5. Click on an event to edit or delete it
6. Use the sidebar to select goals and view associated tasks
7. Drag tasks from the sidebar to the calendar to create events

## Technologies Used

- Frontend:
  - React
  - Redux (with Redux Toolkit)
  - react-big-calendar
  - react-datepicker
  - react-beautiful-dnd
  - Axios

- Backend:
  - Express.js
  - MongoDB
  - Mongoose
  - Cors
