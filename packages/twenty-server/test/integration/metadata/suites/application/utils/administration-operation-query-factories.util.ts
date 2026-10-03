import gql from 'graphql-tag';

const PLACEHOLDER_ID = '20202020-0000-4000-8000-000000000000';
const PLACEHOLDER_TEXT = 'application-token-probe';

export type CallingApplication = {
  applicationId: string;
  applicationUniversalIdentifier: string;
  applicationRegistrationId: string;
};

// One type-valid request per operation an installed application is refused on.
// The values only have to pass GraphQL validation: the refusal happens before
// any of them is read. Operations that name a target application name the
// calling one, so ApplicationTargetGuard lets the request through to the
// principal check.
export const ADMINISTRATION_OPERATION_QUERY_FACTORIES = {
  createDevelopmentApplication: () => ({
    query: gql`
      mutation CreateDevelopmentApplication(
        $universalIdentifier: String!
        $name: String!
      ) {
        createDevelopmentApplication(
          universalIdentifier: $universalIdentifier
          name: $name
        ) {
          __typename
        }
      }
    `,
    variables: {
      universalIdentifier: PLACEHOLDER_TEXT,
      name: PLACEHOLDER_TEXT,
    },
  }),
  syncApplication: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation SyncApplication($manifest: JSON!) {
        syncApplication(manifest: $manifest) {
          __typename
        }
      }
    `,
    variables: {
      manifest: {
        application: { universalIdentifier: applicationUniversalIdentifier },
      },
    },
  }),
  createApplicationFileUploads: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation CreateApplicationFileUploads(
        $applicationUniversalIdentifier: String!
        $files: [ApplicationFileUploadRequestInput!]!
      ) {
        createApplicationFileUploads(
          applicationUniversalIdentifier: $applicationUniversalIdentifier
          files: $files
        ) {
          __typename
        }
      }
    `,
    variables: { applicationUniversalIdentifier, files: [] },
  }),
  completeApplicationFileUploads: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation CompleteApplicationFileUploads(
        $applicationUniversalIdentifier: String!
        $fileIds: [UUID!]!
      ) {
        completeApplicationFileUploads(
          applicationUniversalIdentifier: $applicationUniversalIdentifier
          fileIds: $fileIds
        ) {
          __typename
        }
      }
    `,
    variables: { applicationUniversalIdentifier, fileIds: [] },
  }),
  installMarketplaceApp: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation InstallMarketplaceApp($universalIdentifier: String!) {
        installMarketplaceApp(universalIdentifier: $universalIdentifier)
      }
    `,
    variables: { universalIdentifier: applicationUniversalIdentifier },
  }),
  installApplication: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation InstallApplication($universalIdentifier: String!) {
        installApplication(universalIdentifier: $universalIdentifier) {
          __typename
        }
      }
    `,
    variables: { universalIdentifier: applicationUniversalIdentifier },
  }),
  triggerInstallApplicationJob: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation TriggerInstallApplicationJob(
        $input: TriggerInstallApplicationJobInput!
      ) {
        triggerInstallApplicationJob(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: { universalIdentifier: applicationUniversalIdentifier },
    },
  }),
  triggerUninstallApplicationJob: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation TriggerUninstallApplicationJob(
        $input: TriggerUninstallApplicationJobInput!
      ) {
        triggerUninstallApplicationJob(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: { universalIdentifier: applicationUniversalIdentifier },
    },
  }),
  updateApplication: ({ applicationId }: CallingApplication) => ({
    query: gql`
      mutation UpdateApplication($id: UUID!, $input: UpdateApplicationInput!) {
        updateApplication(id: $id, input: $input) {
          __typename
        }
      }
    `,
    variables: { id: applicationId, input: {} },
  }),
  uninstallApplication: ({
    applicationUniversalIdentifier,
  }: CallingApplication) => ({
    query: gql`
      mutation UninstallApplication($universalIdentifier: String!) {
        uninstallApplication(universalIdentifier: $universalIdentifier)
      }
    `,
    variables: { universalIdentifier: applicationUniversalIdentifier },
  }),
  upgradeApplication: ({ applicationRegistrationId }: CallingApplication) => ({
    query: gql`
      mutation UpgradeApplication(
        $appRegistrationId: String!
        $targetVersion: String!
      ) {
        upgradeApplication(
          appRegistrationId: $appRegistrationId
          targetVersion: $targetVersion
        )
      }
    `,
    variables: {
      appRegistrationId: applicationRegistrationId,
      targetVersion: PLACEHOLDER_TEXT,
    },
  }),
  createApplicationRegistration: () => ({
    query: gql`
      mutation CreateApplicationRegistration(
        $input: CreateApplicationRegistrationInput!
      ) {
        createApplicationRegistration(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { name: PLACEHOLDER_TEXT } },
  }),
  updateApplicationRegistration: ({
    applicationRegistrationId,
  }: CallingApplication) => ({
    query: gql`
      mutation UpdateApplicationRegistration(
        $input: UpdateApplicationRegistrationInput!
      ) {
        updateApplicationRegistration(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: applicationRegistrationId, update: {} } },
  }),
  deleteApplicationRegistration: ({
    applicationRegistrationId,
  }: CallingApplication) => ({
    query: gql`
      mutation DeleteApplicationRegistration($id: String!) {
        deleteApplicationRegistration(id: $id)
      }
    `,
    variables: { id: applicationRegistrationId },
  }),
  rotateApplicationRegistrationClientSecret: ({
    applicationRegistrationId,
  }: CallingApplication) => ({
    query: gql`
      mutation RotateApplicationRegistrationClientSecret($id: String!) {
        rotateApplicationRegistrationClientSecret(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: applicationRegistrationId },
  }),
  updateApplicationRegistrationVariable: () => ({
    query: gql`
      mutation UpdateApplicationRegistrationVariable(
        $input: UpdateApplicationRegistrationVariableInput!
      ) {
        updateApplicationRegistrationVariable(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_TEXT, update: {} } },
  }),
  syncMarketplaceCatalog: () => ({
    query: gql`
      mutation SyncMarketplaceCatalog {
        syncMarketplaceCatalog
      }
    `,
    variables: {},
  }),
  updateWorkspaceMemberRole: () => ({
    query: gql`
      mutation UpdateWorkspaceMemberRole(
        $workspaceMemberId: UUID!
        $roleId: UUID!
      ) {
        updateWorkspaceMemberRole(
          workspaceMemberId: $workspaceMemberId
          roleId: $roleId
        ) {
          __typename
        }
      }
    `,
    variables: { workspaceMemberId: PLACEHOLDER_ID, roleId: PLACEHOLDER_ID },
  }),
  createOneRole: () => ({
    query: gql`
      mutation CreateOneRole($createRoleInput: CreateRoleInput!) {
        createOneRole(createRoleInput: $createRoleInput) {
          __typename
        }
      }
    `,
    variables: { createRoleInput: { label: PLACEHOLDER_TEXT } },
  }),
  updateOneRole: () => ({
    query: gql`
      mutation UpdateOneRole($updateRoleInput: UpdateRoleInput!) {
        updateOneRole(updateRoleInput: $updateRoleInput) {
          __typename
        }
      }
    `,
    variables: { updateRoleInput: { update: {}, id: PLACEHOLDER_ID } },
  }),
  deleteOneRole: () => ({
    query: gql`
      mutation DeleteOneRole($roleId: UUID!) {
        deleteOneRole(roleId: $roleId)
      }
    `,
    variables: { roleId: PLACEHOLDER_ID },
  }),
  upsertObjectPermissions: () => ({
    query: gql`
      mutation UpsertObjectPermissions(
        $upsertObjectPermissionsInput: UpsertObjectPermissionsInput!
      ) {
        upsertObjectPermissions(
          upsertObjectPermissionsInput: $upsertObjectPermissionsInput
        ) {
          __typename
        }
      }
    `,
    variables: {
      upsertObjectPermissionsInput: {
        roleId: PLACEHOLDER_ID,
        objectPermissions: [],
      },
    },
  }),
  upsertPermissionFlags: () => ({
    query: gql`
      mutation UpsertPermissionFlags(
        $upsertPermissionFlagsInput: UpsertPermissionFlagsInput!
      ) {
        upsertPermissionFlags(
          upsertPermissionFlagsInput: $upsertPermissionFlagsInput
        ) {
          __typename
        }
      }
    `,
    variables: {
      upsertPermissionFlagsInput: {
        roleId: PLACEHOLDER_ID,
        permissionFlagKeys: [],
      },
    },
  }),
  upsertFieldPermissions: () => ({
    query: gql`
      mutation UpsertFieldPermissions(
        $upsertFieldPermissionsInput: UpsertFieldPermissionsInput!
      ) {
        upsertFieldPermissions(
          upsertFieldPermissionsInput: $upsertFieldPermissionsInput
        ) {
          __typename
        }
      }
    `,
    variables: {
      upsertFieldPermissionsInput: {
        roleId: PLACEHOLDER_ID,
        fieldPermissions: [],
      },
    },
  }),
  upsertRowLevelPermissionPredicates: () => ({
    query: gql`
      mutation UpsertRowLevelPermissionPredicates(
        $input: UpsertRowLevelPermissionPredicatesInput!
      ) {
        upsertRowLevelPermissionPredicates(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: {
        roleId: PLACEHOLDER_ID,
        objectMetadataId: PLACEHOLDER_ID,
        predicates: [],
        predicateGroups: [],
      },
    },
  }),
  assignRoleToAgent: () => ({
    query: gql`
      mutation AssignRoleToAgent($agentId: UUID!, $roleId: UUID!) {
        assignRoleToAgent(agentId: $agentId, roleId: $roleId)
      }
    `,
    variables: { agentId: PLACEHOLDER_ID, roleId: PLACEHOLDER_ID },
  }),
  removeRoleFromAgent: () => ({
    query: gql`
      mutation RemoveRoleFromAgent($agentId: UUID!) {
        removeRoleFromAgent(agentId: $agentId)
      }
    `,
    variables: { agentId: PLACEHOLDER_ID },
  }),
  createOIDCIdentityProvider: () => ({
    query: gql`
      mutation CreateOIDCIdentityProvider($input: SetupOIDCSsoInput!) {
        createOIDCIdentityProvider(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: {
        name: PLACEHOLDER_TEXT,
        issuer: PLACEHOLDER_TEXT,
        clientID: PLACEHOLDER_TEXT,
        clientSecret: PLACEHOLDER_TEXT,
      },
    },
  }),
  createSAMLIdentityProvider: () => ({
    query: gql`
      mutation CreateSAMLIdentityProvider($input: SetupSAMLSsoInput!) {
        createSAMLIdentityProvider(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: {
        name: PLACEHOLDER_TEXT,
        issuer: PLACEHOLDER_TEXT,
        id: PLACEHOLDER_ID,
        ssoURL: PLACEHOLDER_TEXT,
        certificate: PLACEHOLDER_TEXT,
      },
    },
  }),
  deleteSSOIdentityProvider: () => ({
    query: gql`
      mutation DeleteSSOIdentityProvider($input: DeleteSsoInput!) {
        deleteSSOIdentityProvider(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { identityProviderId: PLACEHOLDER_ID } },
  }),
  editSSOIdentityProvider: () => ({
    query: gql`
      mutation EditSSOIdentityProvider($input: EditSsoInput!) {
        editSSOIdentityProvider(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID, status: 'Active' } },
  }),
  updateWorkspaceAllowedIframeOrigins: () => ({
    query: gql`
      mutation UpdateWorkspaceAllowedIframeOrigins(
        $data: UpdateWorkspaceAllowedIframeOriginsInput!
      ) {
        updateWorkspaceAllowedIframeOrigins(data: $data) {
          __typename
        }
      }
    `,
    variables: {
      data: { operation: PLACEHOLDER_TEXT, origin: PLACEHOLDER_TEXT },
    },
  }),
  deleteCurrentWorkspace: () => ({
    query: gql`
      mutation DeleteCurrentWorkspace {
        deleteCurrentWorkspace {
          __typename
        }
      }
    `,
    variables: {},
  }),
  createApprovedAccessDomain: () => ({
    query: gql`
      mutation CreateApprovedAccessDomain(
        $input: CreateApprovedAccessDomainInput!
      ) {
        createApprovedAccessDomain(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { domain: PLACEHOLDER_TEXT, email: PLACEHOLDER_TEXT } },
  }),
  createPublicDomain: () => ({
    query: gql`
      mutation CreatePublicDomain($domain: String!, $applicationId: String!) {
        createPublicDomain(domain: $domain, applicationId: $applicationId) {
          __typename
        }
      }
    `,
    variables: { domain: PLACEHOLDER_TEXT, applicationId: PLACEHOLDER_TEXT },
  }),
  deletePublicDomain: () => ({
    query: gql`
      mutation DeletePublicDomain($domain: String!) {
        deletePublicDomain(domain: $domain)
      }
    `,
    variables: { domain: PLACEHOLDER_TEXT },
  }),
  createEmailingDomain: () => ({
    query: gql`
      mutation CreateEmailingDomain($input: CreateEmailingDomainInput!) {
        createEmailingDomain(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { domain: PLACEHOLDER_TEXT } },
  }),
  deleteEmailingDomain: () => ({
    query: gql`
      mutation DeleteEmailingDomain($id: String!) {
        deleteEmailingDomain(id: $id)
      }
    `,
    variables: { id: PLACEHOLDER_TEXT },
  }),
  verifyEmailingDomain: () => ({
    query: gql`
      mutation VerifyEmailingDomain($id: String!) {
        verifyEmailingDomain(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: PLACEHOLDER_TEXT },
  }),
  billingPortalSession: () => ({
    query: gql`
      query BillingPortalSession {
        billingPortalSession {
          __typename
        }
      }
    `,
    variables: {},
  }),
  createBillingPaymentMethodSetupIntent: () => ({
    query: gql`
      mutation CreateBillingPaymentMethodSetupIntent {
        createBillingPaymentMethodSetupIntent {
          __typename
        }
      }
    `,
    variables: {},
  }),
  switchSubscriptionInterval: () => ({
    query: gql`
      mutation SwitchSubscriptionInterval {
        switchSubscriptionInterval {
          __typename
        }
      }
    `,
    variables: {},
  }),
  switchBillingPlan: () => ({
    query: gql`
      mutation SwitchBillingPlan {
        switchBillingPlan {
          __typename
        }
      }
    `,
    variables: {},
  }),
  cancelSwitchBillingPlan: () => ({
    query: gql`
      mutation CancelSwitchBillingPlan {
        cancelSwitchBillingPlan {
          __typename
        }
      }
    `,
    variables: {},
  }),
  cancelSwitchBillingInterval: () => ({
    query: gql`
      mutation CancelSwitchBillingInterval {
        cancelSwitchBillingInterval {
          __typename
        }
      }
    `,
    variables: {},
  }),
  setResourceCreditSubscriptionPrice: () => ({
    query: gql`
      mutation SetResourceCreditSubscriptionPrice($priceId: String!) {
        setResourceCreditSubscriptionPrice(priceId: $priceId) {
          __typename
        }
      }
    `,
    variables: { priceId: PLACEHOLDER_TEXT },
  }),
  endSubscriptionTrialPeriod: () => ({
    query: gql`
      mutation EndSubscriptionTrialPeriod {
        endSubscriptionTrialPeriod {
          __typename
        }
      }
    `,
    variables: {},
  }),
  cancelSwitchResourceCreditPrice: () => ({
    query: gql`
      mutation CancelSwitchResourceCreditPrice {
        cancelSwitchResourceCreditPrice {
          __typename
        }
      }
    `,
    variables: {},
  }),
  sendInvitations: () => ({
    query: gql`
      mutation SendInvitations($emails: [String!]!) {
        sendInvitations(emails: $emails) {
          __typename
        }
      }
    `,
    variables: { emails: ['application-token-probe@example.com'] },
  }),
  resendWorkspaceInvitation: () => ({
    query: gql`
      mutation ResendWorkspaceInvitation($appTokenId: String!) {
        resendWorkspaceInvitation(appTokenId: $appTokenId) {
          __typename
        }
      }
    `,
    variables: { appTokenId: PLACEHOLDER_ID },
  }),
  deleteWorkspaceInvitation: () => ({
    query: gql`
      mutation DeleteWorkspaceInvitation($appTokenId: String!) {
        deleteWorkspaceInvitation(appTokenId: $appTokenId)
      }
    `,
    variables: { appTokenId: PLACEHOLDER_ID },
  }),
  updateLabPublicFeatureFlag: () => ({
    query: gql`
      mutation UpdateLabPublicFeatureFlag(
        $input: UpdateLabPublicFeatureFlagInput!
      ) {
        updateLabPublicFeatureFlag(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { publicFeatureFlag: PLACEHOLDER_TEXT, value: false } },
  }),
  createWebhook: () => ({
    query: gql`
      mutation CreateWebhook($input: CreateWebhookInput!) {
        createWebhook(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { targetUrl: PLACEHOLDER_TEXT, operations: [] } },
  }),
  updateWebhook: () => ({
    query: gql`
      mutation UpdateWebhook($input: UpdateWebhookInput!) {
        updateWebhook(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID, update: {} } },
  }),
  deleteWebhook: () => ({
    query: gql`
      mutation DeleteWebhook($id: UUID!) {
        deleteWebhook(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: PLACEHOLDER_ID },
  }),
  deleteOneLogicFunction: () => ({
    query: gql`
      mutation DeleteOneLogicFunction($input: LogicFunctionIdInput!) {
        deleteOneLogicFunction(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID } },
  }),
  createOneLogicFunction: () => ({
    query: gql`
      mutation CreateOneLogicFunction(
        $input: CreateLogicFunctionFromSourceInput!
      ) {
        createOneLogicFunction(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { name: PLACEHOLDER_TEXT } },
  }),
  createFrontComponent: () => ({
    query: gql`
      mutation CreateFrontComponent($input: CreateFrontComponentInput!) {
        createFrontComponent(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: {
        name: PLACEHOLDER_TEXT,
        sourceComponentPath: PLACEHOLDER_TEXT,
        builtComponentPath: PLACEHOLDER_TEXT,
        componentName: PLACEHOLDER_TEXT,
        builtComponentChecksum: PLACEHOLDER_TEXT,
      },
    },
  }),
  updateFrontComponent: () => ({
    query: gql`
      mutation UpdateFrontComponent($input: UpdateFrontComponentInput!) {
        updateFrontComponent(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID, update: {} } },
  }),
  deleteFrontComponent: () => ({
    query: gql`
      mutation DeleteFrontComponent($id: UUID!) {
        deleteFrontComponent(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: PLACEHOLDER_ID },
  }),
  createOneAgent: () => ({
    query: gql`
      mutation CreateOneAgent($input: CreateAgentInput!) {
        createOneAgent(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: {
        label: PLACEHOLDER_TEXT,
        prompt: PLACEHOLDER_TEXT,
        modelId: PLACEHOLDER_TEXT,
      },
    },
  }),
  updateOneAgent: () => ({
    query: gql`
      mutation UpdateOneAgent($input: UpdateAgentInput!) {
        updateOneAgent(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID } },
  }),
  deleteOneAgent: () => ({
    query: gql`
      mutation DeleteOneAgent($input: AgentIdInput!) {
        deleteOneAgent(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID } },
  }),
  createSkill: () => ({
    query: gql`
      mutation CreateSkill($input: CreateSkillInput!) {
        createSkill(input: $input) {
          __typename
        }
      }
    `,
    variables: {
      input: {
        name: PLACEHOLDER_TEXT,
        label: PLACEHOLDER_TEXT,
        content: PLACEHOLDER_TEXT,
      },
    },
  }),
  updateSkill: () => ({
    query: gql`
      mutation UpdateSkill($input: UpdateSkillInput!) {
        updateSkill(input: $input) {
          __typename
        }
      }
    `,
    variables: { input: { id: PLACEHOLDER_ID } },
  }),
  deleteSkill: () => ({
    query: gql`
      mutation DeleteSkill($id: UUID!) {
        deleteSkill(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: PLACEHOLDER_ID },
  }),
  activateSkill: () => ({
    query: gql`
      mutation ActivateSkill($id: UUID!) {
        activateSkill(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: PLACEHOLDER_ID },
  }),
  deactivateSkill: () => ({
    query: gql`
      mutation DeactivateSkill($id: UUID!) {
        deactivateSkill(id: $id) {
          __typename
        }
      }
    `,
    variables: { id: PLACEHOLDER_ID },
  }),
};
