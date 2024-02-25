export type IndexSubtopic = {
  title: string;
  url: string;
};

export type IndexHeading = {
  [heading: string]: IndexSubtopic[];
};

export const UserGuideIndex = {
  'Getting Started': [
    { title: 'What is Twenty', url: 'what-is-twenty' },
    { title: 'Create a Workspace', url: 'create-a-workspace' },
    { title: 'Import your data', url: 'import-your-data' },
  ],
  Objects: [
    { title: 'People', url: 'people' },
    { title: 'Companies', url: 'companies' },
    { title: 'Opportunities', url: 'opportunities' },
    { title: 'Custom Objects', url: 'custom-objects' },
    { title: 'Remote Objects', url: 'remote-objects' },
  ],
  Functions: [
    { title: 'Email', url: 'email' },
    { title: 'Calendar', url: 'calendar' },
    { title: 'Notes', url: 'notes' },
    { title: 'Tasks', url: 'tasks' },
  ],
};
