const WORKDAY_START_HOUR = 9;
const WORKDAY_END_HOUR = 17;

export function addBusinessHours(from: Date, hours: number): Date {
  const deadline = new Date(from);

  let remaining = hours;
  while (remaining > 0) {
    const day = deadline.getUTCDay();
    const isWeekend = day === 0 || day === 6;
    const currentHour = deadline.getUTCHours() + deadline.getUTCMinutes() / 60;

    if (!isWeekend && currentHour >= WORKDAY_START_HOUR && currentHour < WORKDAY_END_HOUR) {
      const hoursLeftToday = WORKDAY_END_HOUR - currentHour;
      if (remaining <= hoursLeftToday) {
        deadline.setUTCHours(deadline.getUTCHours() + remaining, 0, 0, 0);
        remaining = 0;
      } else {
        remaining -= hoursLeftToday;
        deadline.setUTCHours(WORKDAY_END_HOUR, 0, 0, 0);
      }
    } else {
      deadline.setUTCDate(deadline.getUTCDate() + 1);
      deadline.setUTCHours(WORKDAY_START_HOUR, 0, 0, 0);
    }
  }

  return deadline;
}