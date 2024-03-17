import { useTheme } from '@emotion/react';

import { IconBrandGithub } from '../../../display';
import { GITHUB_LINK } from '../constants/GithubLink';

import { ActionLink } from './ActionLink';

export const GithubVersionLink = ({ version }: { version: string }) => {
  const theme = useTheme();

  return (
    <ActionLink href={GITHUB_LINK} target="_blank" rel="noreferrer">
      <IconBrandGithub size={theme.icon.size.md} />
      {version}
    </ActionLink>
  );
};
