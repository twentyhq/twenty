export const pickCalDavOrganizerEmail = ({
  calendarUserAddresses,
  handle,
}: {
  calendarUserAddresses: string[];
  handle: string;
}): string => {
  const emails = calendarUserAddresses
    .filter((address) => /^mailto:/i.test(address))
    .map((address) => address.replace(/^mailto:/i, ''));

  return (
    emails.find((email) => email.toLowerCase() === handle.toLowerCase()) ??
    emails[0] ??
    handle
  );
};
