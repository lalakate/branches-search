const weekDays = [
  { code: "01", short: "пн" },
  { code: "02", short: "вт" },
  { code: "03", short: "ср" },
  { code: "04", short: "чт" },
  { code: "05", short: "пт" },
  { code: "06", short: "сб" },
  { code: "07", short: "вс" },
];

export function getMobileNumber(branch: any): string {
  const numbers = new Set<string>();

  function extractNumbers(obj: any) {
    if (!obj) return;
    if (Array.isArray(obj)) {
      obj.forEach(extractNumbers);
    } else if (typeof obj === "object") {
      if (obj.mobileNumber) numbers.add(obj.mobileNumber);
      if (obj.phoneNumber) numbers.add(obj.phoneNumber);
      if (obj.contactDetails) extractNumbers(obj.contactDetails);
      Object.values(obj).forEach(extractNumbers);
    }
  }

  extractNumbers(branch);

  if (numbers.size === 0) return "";
  return Array.from(numbers)
    .map(formatPhoneNumber)
    .join(", ");
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  let formatted = digits;
  if (digits.length === 12 && digits.startsWith("375")) {
    formatted = "+" + digits;
  } else if (digits.length === 13 && digits.startsWith("375")) {
    formatted = "+" + digits.slice(0, 3) + " " + digits.slice(3);
  }
  if (formatted.length === 13) {
    return (
      "+" +
      formatted.slice(1, 4) +
      " " +
      formatted.slice(4, 6) +
      " " +
      formatted.slice(6, 9) +
      " " +
      formatted.slice(9, 11) +
      " " +
      formatted.slice(11, 13)
    );
  }
  if (formatted.length === 12) {
    return (
      "+" +
      formatted.slice(1, 4) +
      " " +
      formatted.slice(4, 6) +
      " " +
      formatted.slice(6, 9) +
      " " +
      formatted.slice(9, 11) +
      " " +
      formatted.slice(11, 13)
    );
  }
  return phone;
}

export function getWorkTime(branch: any) {
  let allDays: any[] = [];
  if (Array.isArray(branch.information)) {
    for (const info of branch.information) {
      const avs = info?.availability;
      if (Array.isArray(avs)) {
        for (const av of avs) {
          const days = av?.standartAvailability?.day;
          if (Array.isArray(days)) {
            allDays = allDays.concat(days);
          }
        }
      }
    }
  }
  if (allDays.length === 0) return "Время не указано";

  const dayMap: Record<string, any> = {};
  for (const d of allDays) {
    if (d.dayCode && (!dayMap[d.dayCode] || (d.openingTime && d.closingTime))) {
      dayMap[d.dayCode] = d;
    }
  }


  const dayTimes = weekDays.map(({ code, short }) => {
    const d = dayMap[code];
    if (!d || !d.openingTime || !d.closingTime) return null;
    return {
      code,
      short,
      time: `${d.openingTime.slice(0, 5)}-${d.closingTime.slice(0, 5)}`
    };
  });

  const result: string[] = [];
  let i = 0;
  while (i < dayTimes.length) {
    if (!dayTimes[i]) { i++; continue; }
    let j = i;
    while (
      j + 1 < dayTimes.length &&
      dayTimes[j + 1] &&
      dayTimes[j + 1]!.time === dayTimes[i]!.time
    ) {
      j++;
    }
    const dayLabel = i === j
      ? dayTimes[i]!.short
      : `${dayTimes[i]!.short}-${dayTimes[j]!.short}`;
    result.push(`${dayLabel} ${dayTimes[i]!.time}`);
    i = j + 1;
  }

  return result.join("\n");
}

export function isBranchOpenNow(branch: any) {
  const days = branch.information?.[0]?.availability?.[0]?.standartAvailability?.day;
  if (!days) return false;
  const now = new Date();
  const dayCode = String(now.getDay() === 0 ? 7 : now.getDay()).padStart(2, "0");
  const today = days.find((d: any) => d.dayCode === dayCode);
  if (!today) return false;
  const time = now.toTimeString().slice(0, 5);
  const open = today.openingTime?.slice(0, 5);
  const close = today.closingTime?.slice(0, 5);
  return open && close && time >= open && time <= close;
}

export function worksOnWeekend(branch: any) {
  const days = branch.information?.[0]?.availability?.[0]?.standartAvailability?.day;
  if (!days) return false;
  return days.some((d: any) => (d.dayCode === "06" || d.dayCode === "07") && d.openingTime && d.closingTime);
}

export function getLunchTime(branch: any): string {
  let allDays: any[] = [];
  if (Array.isArray(branch.information)) {
    for (const info of branch.information) {
      const avs = info?.availability;
      if (Array.isArray(avs)) {
        for (const av of avs) {
          const days = av?.standartAvailability?.day;
          if (Array.isArray(days)) {
            allDays = allDays.concat(days);
          }
        }
      }
    }
  }

  const dayLunches = weekDays.map(({ code, short }) => {
    const d = allDays.find((x: any) => x.dayCode === code);
    if (!d || !Array.isArray(d.break) || !d.break[0]?.breakFromTime || !d.break[0]?.breakToTime) return null;
    return {
      code,
      short,
      time: `${d.break[0].breakFromTime.slice(0, 5)}-${d.break[0].breakToTime.slice(0, 5)}`
    };
  });

  const result: string[] = [];
  let i = 0;
  while (i < dayLunches.length) {
    if (!dayLunches[i]) { i++; continue; }
    let j = i;
    while (
      j + 1 < dayLunches.length &&
      dayLunches[j + 1] &&
      dayLunches[j + 1]!.time === dayLunches[i]!.time
    ) {
      j++;
    }
    const dayLabel = i === j
      ? dayLunches[i]!.short
      : `${dayLunches[i]!.short}-${dayLunches[j]!.short}`;
    result.push(`${dayLabel} ${dayLunches[i]!.time}`);
    i = j + 1;
  }

  return result.length > 0 ? result.join("\n") : "Нет информации";
}

export function formatStreetName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/(^|\s|\.|-|,)([а-яa-zё])/g, (m, p1, p2) => p1 + p2.toUpperCase());
}