import { IconBrandGithub } from '@ui/display';
import { ClickToActionLink } from '@ui/navigation/link/components/ClickToActionLink';
import { GITHUB_LINK } from '../constants/GithubLink';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';

interface GithubVersionLinkProps {
  version: string;
}

export const GithubVersionLink = ({ version }: GithubVersionLinkProps) => {
  return (
    <ClickToActionLink href={GITHUB_LINK} target="_blank" rel="noreferrer">
      <IconBrandGithub
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
      />
      {version}
    </ClickToActionLink>
  );
};
