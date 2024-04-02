export type IndexSubtopic = {
  title: string;
  url: string;
};

export type IndexHeading = {
  [heading: string]: IndexSubtopic[];
};

export const USER_GUIDE_INDEX = {
  'Getting Started': [
    { title: 'What is Twenty', url: 'what-is-twenty' },
    { title: 'Create a Workspace', url: 'create-workspace' },
  ],
  Objects: [
    { title: 'Objects', url: 'objects' },
    { title: 'Fields', url: 'fields' },
    { title: 'Views, Sort and Filter', url: 'views-sort-filter' },
    { title: 'Table Views', url: 'table-views' },
    { title: 'Kanban Views', url: 'kanban-views' },
    { title: 'Import/Export Data', url: 'import-export-data' },
  ],
  Functions: [
    { title: 'Emails', url: 'emails' },
    { title: 'Notes', url: 'notes' },
    { title: 'Tasks', url: 'tasks' },
    { title: 'Integrations', url: 'integrations' },
    { title: 'API and Webhooks', url: 'api-webhooks' },
  ],
  Other: [
    { title: 'Glossary', url: 'glossary' },
    { title: 'Tips', url: 'tips' },
    { title: 'Github', url: 'github' },
  ],
};
