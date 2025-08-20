export const findByProperty = <T, K extends keyof T>(property: K, valueToMatch: T[K]) => {
  return (itemToFind: T) => {
    return itemToFind[property] === valueToMatch
  }
}