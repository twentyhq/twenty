import {
  IconBook,
  IconCode,
  IconComponents,
  IconGitPullRequest,
  IconTool,
} from '@tabler/icons-react';

import { Theme } from '@/app/_components/ui/theme/theme';

export const getSectionIcon = (section: string): JSX.Element => {
  const iconSize = Theme.icon.size.md;

  const sectionIcons: Record<string, JSX.Element> = {
    'Getting started': <IconCode size={iconSize} />,
    Contributing: <IconGitPullRequest size={iconSize} />,
    Extending: <IconTool size={iconSize} />,
    Components: <IconComponents size={iconSize} />,
    Developers: <IconCode size={iconSize} />,
  };
  for (const key of Object.keys(sectionIcons)) {
    if (section.includes(key)) {
      return sectionIcons[key];
    }
  }
  return <IconBook size={iconSize} />;
};
