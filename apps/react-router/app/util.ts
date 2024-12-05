const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

// in miliseconds
const units = {
  year: 24 * 60 * 60 * 1000 * 365,
  month: (24 * 60 * 60 * 1000 * 365) / 12,
  day: 24 * 60 * 60 * 1000,
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
  second: 1000,
} as const;

export const getRelativeTime = (d1: number, d2 = +new Date()) => {
  const elapsed = d1 - d2;

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const u in units) {
    const unit = u as keyof typeof units;
    if (Math.abs(elapsed) > units[unit] || unit == "second")
      return rtf.format(Math.round(elapsed / units[unit]), unit);
  }
};
