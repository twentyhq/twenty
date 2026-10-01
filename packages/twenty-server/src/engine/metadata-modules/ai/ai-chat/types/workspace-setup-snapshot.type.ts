export type WorkspaceSetupMailbox = {
  handle: string;
  syncStatus: string;
  syncStage: string;
};

export type WorkspaceSetupEmailCompany = {
  companyId: string;
  name: string;
  threadCount: number;
  lastEmailAt: Date;
  opportunityCount: number;
};

export type WorkspaceSetupEmailContact = {
  personId: string;
  name: string;
  companyName: string | null;
  threadCount: number;
  lastEmailAt: Date;
};

export type WorkspaceSetupSnapshot = {
  readAt: Date;
  mailboxes: WorkspaceSetupMailbox[];
  importedMessageCount: number;
  ownPersonCount: number;
  ownCompanyCount: number;
  ownOpportunityCount: number;
  sampleCompanyNames: string[];
  topEmailCompanies: WorkspaceSetupEmailCompany[];
  topEmailContacts: WorkspaceSetupEmailContact[];
};
