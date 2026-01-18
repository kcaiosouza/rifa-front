import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays
} from 'date-fns';

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;

  const seconds = differenceInSeconds(now, targetDate);

  if (seconds < 60) {
    return 'Alguns segundos atrás';
  }

  const minutes = differenceInMinutes(now, targetDate);
  if (minutes < 60) {
    return minutes === 1
      ? '1 minuto atrás'
      : `${minutes} minutos atrás`;
  }

  const hours = differenceInHours(now, targetDate);
  if (hours < 24) {
    return hours === 1
      ? '1 hora atrás'
      : `${hours} horas atrás`;
  }

  const days = differenceInDays(now, targetDate);
  return days === 1
    ? '1 dia atrás'
    : `${days} dias atrás`;
}
