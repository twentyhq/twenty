import { IconBrandGithub } from '@ui/display';
import { ClickToActionLink } from '@ui/navigation/link/components/ClickToActionLink';
import { GITHUB_LINK } from '../constants/GithubLink';
import { ThemeContext } from '@ui/theme-constants';
import { useContext } from 'react';

interface GithubVersionLinkProps {
  version: string;
}

export const GithubVersionLink = ({ version }: GithubVersionLinkProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <ClickToActionLink href={GITHUB_LINK} target="_blank" rel="noreferrer">
      <IconBrandGithub size={theme.icon.size.md} />
      {version}
    </ClickToActionLink>
  );
};
