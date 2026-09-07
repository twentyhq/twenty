export const COMPANY_GQL_FIELDS = `
    id
    name
    domainName {
      primaryLinkLabel
      primaryLinkUrl
      secondaryLinks {
        label
        url
      }
    }
    linkedinLink {
      primaryLinkLabel
      primaryLinkUrl
      secondaryLinks {
        label
        url
      }
    }
    createdAt
    deletedAt
`;
