export const formatDate = (
  date: Date,
  format: 'full' | 'date' | 'time' | 'iso' = 'iso'
): string => {
  switch (format) {
    case 'full':
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'date':
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    case 'iso':
    default:
      return date.toISOString();
  }
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const isExpired = (expiryDate: Date): boolean => {
  return new Date() > expiryDate;
};

export const getTimeDifference = (
  date1: Date,
  date2: Date
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} => {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};
