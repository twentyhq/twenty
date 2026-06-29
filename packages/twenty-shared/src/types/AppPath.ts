export enum AppPath {
  // Not logged-in
  Verify = '/verify',
  VerifyEmail = '/verify-email',
  SignInUp = '/welcome',
  SignInUpV2 = '/welcome-v2',
  Invite = '/invite/:workspaceInviteHash',
  ResetPassword = '/reset-password/:passwordResetToken',

  // Onboarding
  WorkspaceActivation = '/workspace-activation',
  WorkspaceActivationV2 = '/workspace-activation-v2',
  CreateProfile = '/create/profile',
  CreateProfileV2 = '/create/profile-v2',
  SyncEmails = '/sync/emails',
  SyncEmailsV2 = '/sync/emails-v2',
  InviteTeam = '/invite-team',
  InviteTeamV2 = '/invite-team-v2',
  PlanRequired = '/plan-required',
  PlanRequiredV2 = '/plan-required-v2',
  PlanRequiredSuccess = '/plan-required/payment-success',
  BookCallDecision = '/book-call-decision',
  BookCall = '/book-call',

  // Onboarded
  Index = '/',
  TasksPage = '/objects/tasks',
  OpportunitiesPage = '/objects/opportunities',

  RecordIndexPage = '/objects/:objectNamePlural',
  RecordShowPage = '/object/:objectNameSingular/:objectRecordId',
  PageLayoutPage = '/page/:pageLayoutId',

  Settings = `settings`,
  SettingsCatchAll = `/${Settings}/*`,
  Developers = `developers`,
  DevelopersCatchAll = `/${Developers}/*`,

  Authorize = '/authorize',

  // Deep link for twenty.com/dpa → in-app DPA generator (login-gated redirect).
  Dpa = '/dpa',

  // 404 page not found
  NotFoundWildcard = '*',
  NotFound = '/not-found',
}
