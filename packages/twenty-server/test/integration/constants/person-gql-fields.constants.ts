export const PERSON_GQL_FIELDS = `
    id
    city
    jobTitle
    avatarUrl
    intro
    searchVector
    name {
      firstName
      lastName
    }   
    emails {
      primaryEmail
      additionalEmails
    }
    phones {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones
    }
    whatsapp {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones
    }
    createdAt
    deletedAt
`;
