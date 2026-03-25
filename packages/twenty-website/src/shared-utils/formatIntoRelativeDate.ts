import { differenceInDays, formatDistance } from 'date-fns';

const formatIntoRelativeDate = (dateString: string) => {
  if (!dateString) return '';
  const inputDate = new Date(dateString);
  const currentDate = new Date();

  const daysDifference = differenceInDays(currentDate, inputDate);
  let formattedDate = '';
  if (daysDifference === 0) {
    formattedDate = 'today';
  } else if (daysDifference === 1) {
    formattedDate = 'yesterday';
  } else if (daysDifference < 7) {
    formattedDate = formatDistance(inputDate, currentDate, { addSuffix: true });
  } else if (daysDifference < 14) {
    formattedDate = 'last week';
  } else if (daysDifference < 30) {
    formattedDate = Math.floor(daysDifference / 7) + ' weeks ago';
  } else if (daysDifference < 60) {
    formattedDate = 'last month';
  } else if (daysDifference < 365) {
    formattedDate = Math.floor(daysDifference / 30) + ' months';
  } else if (daysDifference < 730) {
    formattedDate = 'last year';
  } else {
    formattedDate = Math.floor(daysDifference / 365) + ' years ago';
  }
  return formattedDate;
};

export { formatIntoRelativeDate };
