import { IconBrandGithub } from '@ui/icon';
import { ClickToActionLink } from '@ui/navigation/ClickToActionLink/ClickToActionLink';
import { GITHUB_LINK } from '@ui/navigation/Link/constants/GithubLink';
import { useTheme } from '@ui/theme-constants';

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
