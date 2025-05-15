export function formatDate(dateString: string) {
  const date = new Date(dateString);

  const dayMap = {
    Sun: 'Sun',
    Mon: 'Mon',
    Tue: 'Tue',
    Wed: 'Wed',
    Thu: 'Thur',
    Fri: 'Fri',
    Sat: 'Sat',
  };

  const dayShort = date.toLocaleString('en-US', {weekday: 'short'});
  const weekday = dayMap[dayShort];

  const day = date.toLocaleString('en-US', {day: '2-digit'});
  const month = date.toLocaleString('en-US', {month: 'long'});
  const year = date.toLocaleString('en-US', {year: '2-digit'});
  // time is not being used here.
  const time = date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${weekday}, ${day} ${month} ${year}`;
}

export function formatDMYDate(dateString: Date) {
  const date = dateString;
  const day = date.getDate();
  const year = date.getFullYear();

  // Get month name using an array
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()]; // May (0-based month)

  return `${day} ${month} ${year}`;
}
