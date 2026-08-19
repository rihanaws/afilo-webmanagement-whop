const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 17;

export function addBusinessHours(from: Date, hours: number): Date {
  const deadline = new Date(from);

  let remaining = hours;
  while (remaining > 0) {
    const day = deadline.getDay();
    const isWeekend = day === 0 || day === 6;
    const currentHour = deadline.getHours() + deadline.getMinutes() / 60;

    if (!isWeekend && currentHour >= WORKDAY_START_HOUR && currentHour < WORKDAY_END_HOUR) {
      const hoursLeftToday = WORKDAY_END_HOUR - currentHour;
      if (remaining <= hoursLeftToday) {
        deadline.setHours(deadline.getHours() + remaining, 0, 0, 0);
        remaining = 0;
      } else {
        remaining -= hoursLeftToday;
        deadline.setHours(WORKDAY_END_HOUR, 0, 0, 0);
      }
    } else {
      deadline.setDate(deadline.getDate() + 1);
      deadline.setHours(WORKDAY_START_HOUR, 0, 0, 0);
    }
  }

  return deadline;
}