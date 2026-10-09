export enum AppPath {
  Verify = '/verify',
  VerifyEmail = '/verify-email',
  SignInUp = '/welcome',
  Invite = '/invite/:workspaceInviteHash',
  ResetPassword = '/reset-password/:passwordResetToken',

  WorkspaceActivation = '/workspace-activation',
  CreateProfile = '/create/profile',
  SyncEmails = '/sync/emails',
  InviteTeam = '/invite-team',
  PlanRequired = '/plan-required',
  PlanRequiredSuccess = '/plan-required/payment-success',
  BookCall = '/book-call',

  AiChat = '/chat/:threadId?',
  AiChatInbox = '/inbox/:threadId?',
  Index = '/',
  // Mobile only: the navigation menu is a page there rather than a drawer.
  Home = '/home',
  TasksPage = '/objects/tasks',
  OpportunitiesPage = '/objects/opportunities',

  RecordIndexPage = '/objects/:objectNamePlural',
  RecordShowPage = '/object/:objectNameSingular/:objectRecordId',
  PageLayoutPage = '/page/:pageLayoutId',
  WorkflowCoreShowPage = '/workflow/:coreWorkflowId',
  AgentIndexPage = '/agents',
  AgentShowPage = '/agent/:agentId',

  Settings = `settings`,
  SettingsCatchAll = `/${Settings}/*`,
  Developers = `developers`,
  DevelopersCatchAll = `/${Developers}/*`,

  Authorize = '/authorize',

  // Deep link for twenty.com/dpa → in-app DPA generator (login-gated redirect).
  Dpa = '/dpa',

  NotFoundWildcard = '*',
  NotFound = '/not-found',
}
