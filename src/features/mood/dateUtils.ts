export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getTodayKey = (): string => formatDateKey(new Date());

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map((part) => Number(part));
  return new Date(year, month - 1, day);
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getWeekdayOffset = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const toHumanDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const fromTimeToHourMinute = (time: string): { hour: number; minute: number } => {
  const [hourString, minuteString] = time.split(':');
  return {
    hour: Number(hourString ?? 20),
    minute: Number(minuteString ?? 30),
  };
};

export const fromHourMinuteToTime = (hour: number, minute: number): string => {
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
};
