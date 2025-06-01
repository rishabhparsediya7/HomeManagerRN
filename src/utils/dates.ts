import {months} from '../constants';

// Get date in YYYY-MM-DD format
export const formatDateToISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get date in DD-MM-YYYY format
export const formatDateToDMY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Get the Monday of the week for any given date
export const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

// Get array of dates for the whole week (Mon-Sun) given any date
export const getWeekDates = (date: Date) => {
  const monday = getMonday(date);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(monday);
    currentDate.setDate(monday.getDate() + i);

    weekDates.push({
      day: weekDays[i],
      date: formatDateToDMY(currentDate),
      isoDate: formatDateToISO(currentDate),
    });
  }

  return {
    month: months[date.getMonth()],
    weekDates,
  };
};

export function getWeek() {
  let date = new Date();
  const start = date.getDate() - date.getDay();
  let dateArray: string[] = [];
  for (var i = 1; i <= 7; i++) {
    const newDate = new Date(date.getFullYear(), date.getMonth(), start + i);
    let dateString = String(
      newDate.getDate().toString().padStart(2, '0') +
        '-' +
        (newDate.getMonth() + 1).toString().padStart(2, '0') +
        '-' +
        newDate.getFullYear().toString(),
    );
    dateArray.push(dateString);
  }
  return dateArray;
}

export function getMonth() {
  const date = new Date();
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  return formatDate(startDate);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero
  const day = String(date.getDate()).padStart(2, '0'); // Add leading zero
  return `${year}-${month}-${day}`;
}

export const getMonthStartAndEndDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};
