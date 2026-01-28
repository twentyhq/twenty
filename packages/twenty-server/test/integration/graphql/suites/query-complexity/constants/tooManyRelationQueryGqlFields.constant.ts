export const TOO_MANY_RELATION_QUERY_GQL_FIELDS = `
    id
    city
    jobTitle
    avatarUrl
    intro
    searchVector
    pointOfContactForOpportunities {
      edges {
        node {
          id
          company {
            id
          }
        }
      }
    }
    favorites {
      edges {
        node {
          id
          company {
            id
          }
          person {
            id
            company {
              id
            }
          }
        }
      }
    }
    noteTargets {
      edges {
        node {
          id
          targetCompany {
            id
          }
          note {
            id
          }
          targetPerson {
            id
            company {
              id
            }
          }
          targetCompany {
            id
          }
          targetOpportunity {
            id
          }
        }
      }
    }
    taskTargets {
      edges {
        node {
          id
          targetCompany {
            id
          }
          targetPerson {
            id
            company {
              id
            }
          }
          targetCompany {
            id
          }
          targetOpportunity {
            id
          }
        }
      }
    }
    company {
      id
      people {
        edges {
          node {
            id
            company {
              id
            }
          }
        }
      }
    }
`;
