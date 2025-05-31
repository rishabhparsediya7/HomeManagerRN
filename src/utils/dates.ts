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

// Parse DD-MM-YYYY to Date object
export const parseDMYDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
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

export function getMonthDates() {
  const date = new Date();
  const lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  let dateArray = [];
  const ending = parseInt(String(lastDate.getDate()));
  for (var i = 1; i <= ending; i++) {
    const newDate = new Date(date.getFullYear(), date.getMonth(), i);
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

export function getDatesInCurrentMonthWithTimes(
  startTime = '00:00:00',
  endTime = '18:30:00',
) {
  const today = new Date();
  const thisMonth = today.getMonth(); // 0-11 for month
  const daysInMonth = new Date(today.getFullYear(), thisMonth + 1, 0).getDate();
  const dates = [];
  for (let i = 0; i < daysInMonth; i++) {
    const currentDate = new Date(today.getFullYear(), thisMonth, i + 1);
    const formattedEndDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      parseInt(endTime.split(':')[0]),
      parseInt(endTime.split(':')[1]),
      parseInt(endTime.split(':')[2]),
      0, // Milliseconds set to 0
    ).toISOString();

    dates.push(formattedEndDate);
  }

  return dates.map(date => {
    return date.replace('T13:00:00.000Z', 'T00:00:00.000Z');
  });
}

export const getDateRanges = () => {
  const today = new Date();

  const firstDayOfWeek = new Date(today);
  const dayOfWeek = today.getDay();

  firstDayOfWeek.setDate(
    today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
  );

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Move to Sunday

  // First and last day of the month
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Correct last day

  return {
    firstDayOfWeek: firstDayOfWeek.toLocaleDateString('en-CA'), // YYYY-MM-DD
    lastDayOfWeek: lastDayOfWeek.toLocaleDateString('en-CA'),
    firstDayOfMonth: firstDayOfMonth.toLocaleDateString('en-CA'),
    lastDayOfMonth: lastDayOfMonth.toLocaleDateString('en-CA'),
  };
};

export const getUTCDate = (input: string) => {
  const [day, month, year] = input.split('/').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0)).toISOString();
  return date;
};

export const getWholeWeekDates = (isoString: string) => {
  console.log('🚀 ~ getWholeWeekDates ~ isoString:', isoString);
  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const date = new Date(isoString);
  console.log('🚀 ~ getWholeWeekDates ~ date:', date);
  const dayOfWeek = date.getUTCDay();

  const startOfWeek = new Date(date);
  console.log('🚀 ~ getWholeWeekDates ~ startOfWeek:', startOfWeek);
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  console.log('🚀 ~ getWholeWeekDates ~ diffToMonday:', diffToMonday);
  startOfWeek.setUTCDate(date.getUTCDate() + diffToMonday);

  // Generate an array of the dates for the week
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(startOfWeek);
    weekDate.setUTCDate(startOfWeek.getUTCDate() + i);
    const dateObj = {
      day: weekdays[i],
      date: weekDate.toISOString().split('T')[0].split('-').reverse().join('-'),
    };
    weekDates.push(dateObj);
  }
  const obj = {
    month: months[date.getMonth()],
    weekDates: weekDates,
  };

  return obj;
};
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
