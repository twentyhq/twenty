export type UserGuideHomeCardsType = {
  url: string;
  title: string;
  subtitle: string;
  image: string;
};

export const USER_GUIDE_HOME_CARDS: UserGuideHomeCardsType[] = [
  {
    url: 'what-is-twenty',
    title: 'What is Twenty',
    subtitle:
      "A brief on Twenty's commitment to reshaping CRM with Open Source",
    image: '/images/user-guide/home/what-is-twenty.png',
  },
  {
    url: 'create-a-workspace',
    title: 'Create a Workspace',
    subtitle: 'Custom objects store unique info in workspaces.',
    image: '/images/user-guide/home/create-a-workspace.png',
  },
  {
    url: 'import-your-data',
    title: 'Import your data',
    subtitle: 'Easily create a note to keep track of important information.',
    image: '/images/user-guide/home/import-your-data.png',
  },
  {
    url: 'custom-objects',
    title: 'Custom Objects',
    subtitle: 'Custom objects store unique info in workspaces.',
    image: '/images/user-guide/home/custom-objects.png',
  },
];
