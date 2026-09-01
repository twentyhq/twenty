// The same logical requests, expressed twice:
// - 'old' selections are what a client generated from the pre-PR schema sends
//   (composite raw JSON sub-fields selected as leaves of the JSON scalar).
// - 'new' selections are what a client generated from the post-PR schema sends
//   (same sub-fields selected as typed objects).

const PERSON_SELECTION = {
  old: {
    name: { firstName: true, lastName: true },
    emails: { primaryEmail: true, additionalEmails: true },
    phones: {
      primaryPhoneNumber: true,
      primaryPhoneCallingCode: true,
      primaryPhoneCountryCode: true,
      additionalPhones: true,
    },
    createdBy: { source: true, name: true, context: true },
  },
  new: {
    name: { firstName: true, lastName: true },
    emails: { primaryEmail: true, additionalEmails: true },
    phones: {
      primaryPhoneNumber: true,
      primaryPhoneCallingCode: true,
      primaryPhoneCountryCode: true,
      additionalPhones: { number: true, callingCode: true, countryCode: true },
    },
    createdBy: { source: true, name: true, context: { provider: true } },
  },
};

const COMPANY_SELECTION = {
  old: {
    name: true,
    domainName: {
      primaryLinkLabel: true,
      primaryLinkUrl: true,
      secondaryLinks: true,
    },
  },
  new: {
    name: true,
    domainName: {
      primaryLinkLabel: true,
      primaryLinkUrl: true,
      secondaryLinks: { label: true, url: true },
    },
  },
};

const CREATE_PERSON_DATA = {
  name: { firstName: 'Compat', lastName: 'Check' },
  emails: {
    primaryEmail: 'compat.check@example.com',
    additionalEmails: ['compat.check+1@example.com', 'compat.check+2@example.com'],
  },
  phones: {
    primaryPhoneNumber: '600000001',
    primaryPhoneCallingCode: '+33',
    primaryPhoneCountryCode: 'FR',
    additionalPhones: [
      { number: '600000002', callingCode: '+33', countryCode: 'FR' },
      { number: '5550100', callingCode: '+1', countryCode: 'US' },
    ],
  },
};

const CREATE_COMPANY_DATA = {
  name: 'Compat Check Corp',
  domainName: {
    primaryLinkLabel: 'main',
    primaryLinkUrl: 'https://compat-check.example.com',
    secondaryLinks: [
      { label: 'docs', url: 'https://docs.compat-check.example.com' },
      { label: 'blog', url: 'https://blog.compat-check.example.com' },
    ],
  },
};

export const runScenario = async ({ client, flavor }) => {
  const personSelection = PERSON_SELECTION[flavor];
  const companySelection = COMPANY_SELECTION[flavor];

  const results = { flavor };

  const seededPeople = await client.query({
    people: {
      __args: {
        first: 5,
        orderBy: [{ name: { firstName: 'AscNullsLast' } }],
      },
      edges: { node: personSelection },
    },
  });
  results.seededPeople = seededPeople.people.edges.map((edge) => edge.node);

  const seededCompanies = await client.query({
    companies: {
      __args: { first: 5, orderBy: [{ name: 'AscNullsLast' }] },
      edges: { node: companySelection },
    },
  });
  results.seededCompanies = seededCompanies.companies.edges.map(
    (edge) => edge.node,
  );

  const createdPerson = await client.mutation({
    createPerson: {
      __args: { data: CREATE_PERSON_DATA },
      id: true,
      ...personSelection,
    },
  });
  results.createdPerson = createdPerson.createPerson;
  const createdPersonId = createdPerson.createPerson.id;

  const createdCompany = await client.mutation({
    createCompany: {
      __args: { data: CREATE_COMPANY_DATA },
      id: true,
      ...companySelection,
    },
  });
  results.createdCompany = createdCompany.createCompany;
  const createdCompanyId = createdCompany.createCompany.id;

  const readBackPerson = await client.query({
    person: {
      __args: { filter: { id: { eq: createdPersonId } } },
      ...personSelection,
    },
  });
  results.readBackPerson = readBackPerson.person;

  const updatedPerson = await client.mutation({
    updatePerson: {
      __args: {
        id: createdPersonId,
        data: {
          phones: {
            ...CREATE_PERSON_DATA.phones,
            additionalPhones: [
              { number: '700000009', callingCode: '+44', countryCode: 'GB' },
            ],
          },
        },
      },
      ...personSelection,
    },
  });
  results.updatedPerson = updatedPerson.updatePerson;

  await client.mutation({
    destroyPerson: { __args: { id: createdPersonId }, id: true },
  });
  await client.mutation({
    destroyCompany: { __args: { id: createdCompanyId }, id: true },
  });

  return results;
};
