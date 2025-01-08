import { capitalize } from 'twenty-shared';

export function getFirstNameAndLastNameFromHandleAndDisplayName(
  handle: string,
  displayName: string,
): { firstName: string; lastName: string } {
  const firstName = displayName.split(' ')[0];
  const lastName = displayName.split(' ')[1];

  const contactFullNameFromHandle = handle.split('@')[0];
  const firstNameFromHandle = contactFullNameFromHandle.split('.')[0];
  const lastNameFromHandle = contactFullNameFromHandle.split('.')[1];

  return {
    firstName: capitalize(firstName || firstNameFromHandle || ''),
    lastName: capitalize(lastName || lastNameFromHandle || ''),
  };
}
