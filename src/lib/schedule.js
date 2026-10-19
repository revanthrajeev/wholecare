// Pure helpers for consultation slots (safe in server and client code).
export function upcomingDays(count = 14, from = new Date()) {
  const out = [];
  const start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  for (let i = 1; i <= count; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    out.push({ date: d.toISOString().slice(0, 10), weekday: d.getUTCDay() });
  }
  return out;
}

export function slotGrid(doctor, booked = [], count = 14) {
  return upcomingDays(count).map(({ date, weekday }) => {
    const working = doctor.availability?.days?.includes(weekday);
    return {
      date,
      weekday,
      slots: working ? doctor.availability.slots.map((time) => ({ time, available: !booked.some((b) => b.date === date && b.timeSlot === time) })) : [],
    };
  });
}

export function isBookable(doctor, date, time, booked = []) {
  const day = upcomingDays(30).find((d) => d.date === date);
  if (!day || !doctor.availability?.days?.includes(day.weekday)) return false;
  if (!doctor.availability.slots.includes(time)) return false;
  return !booked.some((b) => b.date === date && b.timeSlot === time);
}

function tzOffsetMs(ts, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(ts));
  const get = (t) => Number(parts.find((p) => p.type === t).value);
  return Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")) - ts;
}

// Wall-clock time in an IANA zone -> exact instant (handles DST transitions).
export function zonedToUtc(date, time, timeZone) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  if (!timeZone) return new Date(guess);
  const first = tzOffsetMs(guess, timeZone);
  let utc = guess - first;
  const second = tzOffsetMs(utc, timeZone);
  if (second !== first) utc = guess - second;
  return new Date(utc);
}

const icsStamp = (dt) => dt.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");

export function icsForConsultation(c, siteUrl) {
  const startAt = zonedToUtc(c.date, c.timeSlot, c.timeZone);
  const stamp = icsStamp(new Date());
  const start = icsStamp(startAt);
  const end = icsStamp(new Date(startAt.getTime() + 30 * 60000));
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Whole Care//Consultations//EN",
    "BEGIN:VEVENT",
    `UID:${c.id}@wholecare`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Video consult with ${c.doctorName}`,
    `DESCRIPTION:${(c.reason || "Whole Care video consultation").replace(/\n/g, " ")} — times are in ${c.timezone || "the hospital's local time"}. Join: ${siteUrl}/consultations/${c.id}`,
    `URL:${siteUrl}/consultations/${c.id}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
