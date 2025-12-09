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
          company {
            id
          }
          note {
            id
          }
          person {
            id
            company {
              id
            }
          }
          company {
            id
          }
          opportunity {
            id
          }
        }
      }
    }
    taskTargets {
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
          company {
            id
          }
          opportunity {
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
