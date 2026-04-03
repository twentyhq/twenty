import type { PublicRepoContributor } from '@/lib/github/fetch-public-repo-contributors';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Image from 'next/image';

const TileLink = styled.a`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  box-shadow: none;
  display: grid;
  grid-template-rows: auto auto;
  max-width: 140px;
  overflow: hidden;
  text-decoration: none;
  transition:
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const ImageSlot = styled.div`
  aspect-ratio: 1;
  background-color: ${theme.colors.primary.border[10]};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const Meta = styled.div`
  display: grid;
  gap: ${theme.spacing(1)};
  min-width: 0;
  padding: ${theme.spacing(2)};
  text-align: center;
`;

const Login = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: lowercase;
  white-space: nowrap;
`;

const Count = styled.span`
  color: ${theme.colors.primary.text[40]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2)};
`;

type ContributorTileProps = {
  contributor: PublicRepoContributor;
};

export function ContributorTile({ contributor }: ContributorTileProps) {
  const commitsLabel =
    contributor.contributions === 1
      ? '1 commit'
      : `${contributor.contributions} commits`;

  return (
    <TileLink
      href={contributor.profileUrl}
      rel="noopener noreferrer"
      target="_blank"
      aria-label={`${contributor.login} on GitHub, ${commitsLabel}`}
    >
      <ImageSlot>
        <Image
          alt=""
          fill
          sizes="140px"
          src={contributor.avatarUrl}
          style={{ objectFit: 'cover' }}
        />
      </ImageSlot>
      <Meta>
        <Login>{contributor.login}</Login>
        <Count>{commitsLabel}</Count>
      </Meta>
    </TileLink>
  );
}
