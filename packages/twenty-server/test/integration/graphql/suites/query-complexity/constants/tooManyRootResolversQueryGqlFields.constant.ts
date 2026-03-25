import gql from 'graphql-tag';

export const TOO_MANY_ROOT_RESOLVERS_QUERY_GQL_FIELDS = gql`
  query {
    people {
      edges {
        node {
          id
        }
      }
    }
    companies {
      edges {
        node {
          id
        }
      }
    }
    favorites {
      edges {
        node {
          id
        }
      }
    }
    tasks {
      edges {
        node {
          id
        }
      }
    }
    notes {
      edges {
        node {
          id
        }
      }
    }
    attachments {
      edges {
        node {
          id
        }
      }
    }
    noteTargets {
      edges {
        node {
          id
        }
      }
    }
    taskTargets {
      edges {
        node {
          id
        }
      }
    }
    opportunities {
      edges {
        node {
          id
        }
      }
    }
    blocklists {
      edges {
        node {
          id
        }
      }
    }
    calendarEvents {
      edges {
        node {
          id
        }
      }
    }
    calendarEventParticipants {
      edges {
        node {
          id
        }
      }
    }
    calendarChannels {
      edges {
        node {
          id
        }
      }
    }
    calendarChannelEventAssociations {
      edges {
        node {
          id
        }
      }
    }
    messageThreads {
      edges {
        node {
          id
        }
      }
    }
    messageChannels {
      edges {
        node {
          id
        }
      }
    }
    messageChannelMessageAssociations {
      edges {
        node {
          id
        }
      }
    }
    timelineActivities {
      edges {
        node {
          id
        }
      }
    }
    workflowRuns {
      edges {
        node {
          id
        }
      }
    }
    workflowVersions {
      edges {
        node {
          id
        }
      }
    }
    workflowAutomatedTriggers {
      edges {
        node {
          id
        }
      }
    }
  }
`;
