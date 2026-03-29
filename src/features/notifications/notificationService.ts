import * as Notifications from 'expo-notifications';

import { REMINDER_MESSAGES } from '@/src/constants/mood';
import { fromTimeToHourMinute } from '@/src/features/mood/dateUtils';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const getRandomReminderBody = () => {
  const randomIndex = Math.floor(Math.random() * REMINDER_MESSAGES.length);
  return REMINDER_MESSAGES[randomIndex];
};

const getNextReminderDate = (hour: number, minute: number, hasTodayEntry: boolean) => {
  const now = new Date();
  const nextReminder = new Date(now);
  nextReminder.setHours(hour, minute, 0, 0);

  if (hasTodayEntry || nextReminder.getTime() <= now.getTime()) {
    nextReminder.setDate(nextReminder.getDate() + 1);
  }

  return nextReminder;
};

export const notificationService = {
  async requestPermissionIfNeeded(): Promise<boolean> {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) {
      return true;
    }

    const asked = await Notifications.requestPermissionsAsync();
    return asked.granted;
  },

  async rescheduleDailyReminder(params: {
    enabled: boolean;
    reminderTime: string;
    hasTodayEntry: boolean;
  }): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!params.enabled) {
      return;
    }

    const granted = await this.requestPermissionIfNeeded();
    if (!granted) {
      return;
    }

    const { hour, minute } = fromTimeToHourMinute(params.reminderTime);
    const nextReminder = getNextReminderDate(hour, minute, params.hasTodayEntry);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Moodot',
        body: getRandomReminderBody(),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextReminder,
      },
    });
  },
};
