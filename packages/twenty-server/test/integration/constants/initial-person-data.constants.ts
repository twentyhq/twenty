import { PERSON_2_ID } from 'test/integration/constants/mock-person-ids.constants';

export const INITIAL_PERSON_DATA = {
  id: PERSON_2_ID,
  name: {
    firstName: 'Testing',
    lastName: 'User',
  },
  emails: {
    primaryEmail: 'test8@user.com',
    additionalEmails: ['user8@example.com'],
  },
  city: 'New York',
  jobTitle: 'Manager',
  companyId: '20202020-0713-40a5-8216-82802401d33e',
};
