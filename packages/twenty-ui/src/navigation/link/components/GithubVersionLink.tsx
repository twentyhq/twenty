import { useTheme } from '@emotion/react';
import { IconBrandGithub } from '@ui/display';
import { ClickToActionLink } from '@ui/navigation/link/components/ClickToActionLink';
import { GITHUB_LINK } from '../constants/GithubLink';

interface GithubVersionLinkProps {
  version: string;
}

export const GithubVersionLink = ({ version }: GithubVersionLinkProps) => {
  const theme = useTheme();

  return (
    <ClickToActionLink href={GITHUB_LINK} target="_blank" rel="noreferrer">
      <IconBrandGithub size={theme.icon.size.md} />
      {version}
    </ClickToActionLink>
  );
};
