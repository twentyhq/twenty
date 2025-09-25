export const getRange = (start: number, end: number) => {
  return Array.from({ length: end }, (_, index) => index + start)
}