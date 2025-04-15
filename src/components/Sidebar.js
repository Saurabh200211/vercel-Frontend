import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchGoals } from '../redux/slices/goalsSlice';
import { fetchTasks, fetchTasksByGoal, setSelectedGoal } from '../redux/slices/tasksSlice';
import { createEvent } from '../redux/slices/eventsSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { goals } = useSelector((state) => state.goals);
  const { filteredTasks, selectedGoalId } = useSelector((state) => state.tasks);
  
  useEffect(() => {
    dispatch(fetchGoals());
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleGoalClick = (goalId) => {
    dispatch(setSelectedGoal(goalId));
    dispatch(fetchTasksByGoal(goalId));
  };

  const handleTaskDragStart = (e, task) => {
    e.dataTransfer.setData('task', JSON.stringify(task));
  };

  const handleCreateEventFromTask = (task) => {
    // Get current date and set time to nearest 30-minute interval
    const now = new Date();
    const minutes = Math.ceil(now.getMinutes() / 30) * 30;
    const start = new Date(now.setMinutes(minutes, 0, 0));
    
    // Set end time 30 minutes later
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    
    // Create event from task
    const eventData = {
      title: task.name,
      category: 'work', // Default category
      start,
      end,
      taskId: task._id,
      goalId: task.goalId
    };
    
    dispatch(createEvent(eventData));
  };

  // Function to get goal color
  const getGoalColor = (goalId) => {
    const goal = goals.find(g => g._id === goalId);
    return goal ? goal.color : '#3498db';
  };

  // Function to get goal icon
  const getGoalIcon = (goalName) => {
    const lowerName = goalName.toLowerCase();
    if (lowerName.includes('fit')) return '🏃';
    if (lowerName.includes('academic')) return '📚';
    if (lowerName.includes('learn')) return '🧠';
    if (lowerName.includes('sport')) return '⚽';
    return '🎯';
  };

  // Function to get task icon
  const getTaskIcon = (taskName) => {
    const lowerName = taskName.toLowerCase();
    if (lowerName.includes('ai')) return '🤖';
    if (lowerName.includes('mle')) return '📊';
    if (lowerName.includes('de')) return '💾';
    if (lowerName.includes('basic')) return '📝';
    return '📌';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3>GOALS</h3>
        <ul className="goals-list">
          {goals.map((goal) => (
            <li 
              key={goal._id}
              className={`goal-item ${selectedGoalId === goal._id ? 'selected' : ''}`}
              onClick={() => handleGoalClick(goal._id)}
              style={{ borderLeft: `4px solid ${goal.color}` }}
            >
              <span className="goal-icon" style={{ backgroundColor: goal.color }}>
                {getGoalIcon(goal.name)}
              </span>
              {goal.name}
            </li>
          ))}
        </ul>
      </div>
      
      {selectedGoalId && (
        <div className="sidebar-section">
          <h3>TASKS</h3>
          <ul className="tasks-list">
            {filteredTasks.map((task) => (
              <li
                key={task._id}
                className="task-item"
                draggable
                onDragStart={(e) => handleTaskDragStart(e, task)}
                onClick={() => handleCreateEventFromTask(task)}
                style={{
                  borderLeft: `4px solid ${getGoalColor(task.goalId)}`
                }}
              >
                <span className="task-icon" style={{ backgroundColor: getGoalColor(task.goalId) }}>
                  {getTaskIcon(task.name)}
                </span>
                {task.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
