export const COMPANY_GQL_FIELDS = `
    id
    name
    domainName {
      primaryLinkLabel
      primaryLinkUrl
      secondaryLinks
    }
    linkedinLink {
      primaryLinkLabel
      primaryLinkUrl
      secondaryLinks
    }
    createdAt
    deletedAt
`;
