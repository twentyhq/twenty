export const PERSON_GQL_FIELDS = `
    id
    jobTitle
    avatarUrl
    avatarFile {
      fileId
      label
      extension
      url
    }
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
      additionalPhones {
        number
        callingCode
        countryCode
      }
    }
    whatsapp {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones {
        number
        callingCode
        countryCode
      }
    }
    createdAt
    deletedAt
`;
