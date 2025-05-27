import gql from 'graphql-tag';
import { capitalize } from 'twenty-shared/utils';

type CreateOneOperationFactoryParams = {
  objectMetadataSingularName: string;
  gqlFields: string;
  data?: object;
};

const tmp = `
query GetCurrentUser {
  currentUser {
    ...UserQueryFragment
    __typename
  }
}

fragment UserQueryFragment on User {
  id
  firstName
  lastName
  email
  canAccessFullAdminPanel
  canImpersonate
  supportUserHash
  onboardingStatus
  workspaceMember {
    ...WorkspaceMemberQueryFragment
    __typename
  }
  workspaceMembers {
    ...WorkspaceMemberQueryFragment
    __typename
  }
  deletedWorkspaceMembers {
    ...DeletedWorkspaceMemberQueryFragment
    __typename
  }
  currentUserWorkspace {
    settingsPermissions
    objectRecordsPermissions
    __typename
  }
  currentWorkspace {
    id
    displayName
    logo
    inviteHash
    allowImpersonation
    activationStatus
    isPublicInviteLinkEnabled
    isGoogleAuthEnabled
    isMicrosoftAuthEnabled
    isPasswordAuthEnabled
    subdomain
    hasValidEnterpriseKey
    customDomain
    isCustomDomainEnabled
    workspaceUrls {
      subdomainUrl
      customUrl
      __typename
    }
    featureFlags {
      key
      value
      __typename
    }
    metadataVersion
    currentBillingSubscription {
      id
      status
      interval
      billingSubscriptionItems {
        id
        hasReachedCurrentPeriodCap
        billingProduct {
          name
          description
          metadata {
            planKey
            priceUsageBased
            productKey
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    billingSubscriptions {
      id
      status
      __typename
    }
    workspaceMembersCount
    defaultRole {
      ...RoleFragment
      __typename
    }
    __typename
  }
  workspaces {
    workspace {
      id
      logo
      displayName
      subdomain
      customDomain
      workspaceUrls {
        subdomainUrl
        customUrl
        __typename
      }
      __typename
    }
    __typename
  }
  userVars
  __typename
}

fragment WorkspaceMemberQueryFragment on WorkspaceMember {
  id
  name {
    firstName
    lastName
    __typename
  }
  colorScheme
  avatarUrl
  locale
  userEmail
  timeZone
  dateFormat
  timeFormat
  __typename
}

fragment DeletedWorkspaceMemberQueryFragment on DeletedWorkspaceMember {
  id
  name {
    firstName
    lastName
    __typename
  }
  avatarUrl
  userEmail
  __typename
}

fragment RoleFragment on Role {
  id
  label
  description
  icon
  canUpdateAllSettings
  isEditable
  canReadAllObjectRecords
  canUpdateAllObjectRecords
  canSoftDeleteAllObjectRecords
  canDestroyAllObjectRecords
  __typename
}`;

export const createOneOperationFactory = ({
  objectMetadataSingularName,
  gqlFields,
  data = {},
}: CreateOneOperationFactoryParams) => ({
  query: gql`
    mutation Create${capitalize(objectMetadataSingularName)}($data: ${capitalize(objectMetadataSingularName)}CreateInput) {
    create${capitalize(objectMetadataSingularName)}(data: $data) {
      ${gqlFields}
    }
  }
  `,
  variables: {
    data,
  },
});
