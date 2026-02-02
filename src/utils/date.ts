export const todayISO = (): string => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export const monthKeyFromISODate = (iso: string): string => iso.slice(0, 7) // yyyy-mm

export const formatISODate = (iso: string): string => {
  // expects yyyy-mm-dd
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
