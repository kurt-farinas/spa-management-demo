// Local-time date strings with no zone: 'YYYY-MM-DD' and 'YYYY-MM-DDTHH:mm'
export const pad = (n) => String(n).padStart(2, '0')
export const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const toDateTimeStr = (d) => `${toDateStr(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const addMinutes = (dateTimeStr, min) => toDateTimeStr(new Date(new Date(dateTimeStr).getTime() + min * 60000))
