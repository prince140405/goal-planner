import { useState, useEffect } from 'react';
import { Reminder, Task, Goal } from '../types';
import { getLocalDateString } from '../utils/date';

interface UseReminderAlertsProps {
  reminders: Reminder[];
  tasks: Task[];
  goals: Goal[];
  notificationsEnabled: boolean;
  persistState: (updatedTasks: Task[], updatedGoals: Goal[], updatedReminders: Reminder[]) => void;
  onTaskCheckToggle: (taskId: string) => void;
}

export function useReminderAlerts({
  reminders,
  tasks,
  goals,
  notificationsEnabled,
  persistState,
  onTaskCheckToggle,
}: UseReminderAlertsProps) {
  const [activeTriggeredReminder, setActiveTriggeredReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    const checkReminderInterval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;
      const currentDayIndex = now.getDay();
      const isoNowString = now.toISOString();
      const todayDateStr = getLocalDateString(now);

      reminders.forEach((reminder) => {
        if (!reminder.isActive) return;

        const associatedTask = tasks.find(t => t.id === reminder.taskId);
        if (associatedTask) {
          if (associatedTask.completed) return;
          if (associatedTask.dueDate !== todayDateStr) return;
        }

        // Verify scheduled time
        if (reminder.time === currentTimeString) {
          // Verify repeats today
          if (reminder.days.includes(currentDayIndex)) {
            // Check snooze duration
            if (reminder.snoozedUntil && new Date(reminder.snoozedUntil) > now) {
              return; // Reminder is currently snoozed
            }

            // Verify it hasn't triggered in the current minute already
            const lastTriggerDateStr = reminder.lastTriggered?.split('T')[0];

            // Trigger if never triggered OR last triggered is from a different day
            const wasTriggeredToday =
              lastTriggerDateStr === todayDateStr &&
              reminder.lastTriggered?.slice(11, 16) === currentTimeString;

            if (!wasTriggeredToday) {
              setActiveTriggeredReminder(reminder);

              if (
                notificationsEnabled &&
                typeof Notification !== 'undefined' &&
                Notification.permission === 'granted'
              ) {
                new Notification('FocusSpace reminder', {
                  body: reminder.taskTitle,
                  tag: reminder.id,
                });
              }

              const updatedReminders = reminders.map((r) =>
                r.id === reminder.id
                  ? { ...r, lastTriggered: isoNowString, updatedAt: isoNowString }
                  : r,
              );
              persistState(tasks, goals, updatedReminders);
            }
          }
        }
      });
    }, 8000);

    return () => clearInterval(checkReminderInterval);
  }, [reminders, tasks, goals, persistState, notificationsEnabled]);

  const handleNotificationSnooze = (minutes: number) => {
    if (!activeTriggeredReminder) return;

    const snoozeTarget = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const updated = reminders.map((r) =>
      r.id === activeTriggeredReminder.id
        ? { ...r, snoozedUntil: snoozeTarget, updatedAt: snoozeTarget }
        : r,
    );

    persistState(tasks, goals, updated);
    setActiveTriggeredReminder(null);
  };

  const handleNotificationComplete = () => {
    if (!activeTriggeredReminder) return;

    onTaskCheckToggle(activeTriggeredReminder.taskId);
    setActiveTriggeredReminder(null);
  };

  return {
    activeTriggeredReminder,
    setActiveTriggeredReminder,
    handleNotificationSnooze,
    handleNotificationComplete,
  };
}
