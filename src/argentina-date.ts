const argentinaDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "America/Argentina/Buenos_Aires",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function saturdayFor(time: number) {
  const date = new Date(`${argentinaDate.format(time)}T00:00:00Z`);
  const daysSinceSaturday = (date.getUTCDay() + 1) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceSaturday);
  return { date: date.toISOString().slice(0, 10), isSaturday: daysSinceSaturday === 0 };
}
