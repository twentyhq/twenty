import { useTheme } from '@emotion/react';
import { IconBrandGithub } from '@ui/display';
import { ActionLink } from '@ui/navigation/link/components/ActionLink';
import { GITHUB_LINK } from '../constants/GithubLink';

interface GithubVersionLinkProps {
  version: string;
}

export const GithubVersionLink = ({ version }: GithubVersionLinkProps) => {
  const theme = useTheme();

  return (
    <ActionLink href={GITHUB_LINK} target="_blank" rel="noreferrer">
      <IconBrandGithub size={theme.icon.size.md} />
      {version}
    </ActionLink>
  );
};
