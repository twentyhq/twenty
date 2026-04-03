import type { PublicRepoContributor } from '@/lib/github/fetch-public-repo-contributors';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { ContributorTile } from '../ContributorTile/ContributorTile';

const GridRoot = styled.div`
  column-gap: ${theme.spacing(4)};
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(124px, 1fr));
  justify-items: center;
  row-gap: ${theme.spacing(6)};
  width: 100%;
`;

const StatusMessage = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4)};
  grid-column: 1 / -1;
  margin: 0;
  max-width: 42rem;
  text-align: center;
`;

type GridProps = {
  contributors: PublicRepoContributor[];
  loadFailed: boolean;
};

export function Grid({ contributors, loadFailed }: GridProps) {
  if (loadFailed && contributors.length === 0) {
    return (
      <GridRoot>
        <StatusMessage>
          We could not load contributors from GitHub right now. Please try
          again later, or visit the repository on GitHub to see the full list.
        </StatusMessage>
      </GridRoot>
    );
  }

  if (!loadFailed && contributors.length === 0) {
    return (
      <GridRoot>
        <StatusMessage>No contributors matched the current filters.</StatusMessage>
      </GridRoot>
    );
  }

  return (
    <GridRoot>
      {contributors.map((contributor) => (
        <ContributorTile
          contributor={contributor}
          key={contributor.login}
        />
      ))}
    </GridRoot>
  );
}
