export const formatWhatsappPhoneNumberUtil = (phoneNumber: string): string => {
  return phoneNumber.replace('(', '').replace(')', '').replace(' ', '');
};
