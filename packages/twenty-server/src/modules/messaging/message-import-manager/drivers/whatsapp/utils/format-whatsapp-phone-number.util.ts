export const formatWhatsappPhoneNumberUtil = (phoneNumber: string): string => {
  return phoneNumber
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('-', '')
    .replaceAll(' ', '');
};
