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
    }
    createdAt
    deletedAt
`;
