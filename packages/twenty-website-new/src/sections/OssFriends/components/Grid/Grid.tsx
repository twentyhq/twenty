import type { OssFriend } from '@/lib/oss-friends/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { OssFriendCard } from '../OssFriendCard/OssFriendCard';

const GridRoot = styled.div`
  column-gap: ${theme.spacing(6)};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
  row-gap: ${theme.spacing(6)};
  width: 100%;
`;

const StatusMessage = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4)};
  line-height: 1.65;
  margin: 0;
  max-width: 36rem;
  text-align: center;
`;

type GridProps = {
  friends: OssFriend[];
  loadFailed: boolean;
};

export function Grid({ friends, loadFailed }: GridProps) {
  if (loadFailed && friends.length === 0) {
    return (
      <StatusMessage>
        We could not load OSS friends right now. Please try again later.
      </StatusMessage>
    );
  }

  if (!loadFailed && friends.length === 0) {
    return (
      <StatusMessage>No partners are listed at the moment.</StatusMessage>
    );
  }

  return (
    <GridRoot>
      {friends.map((friend) => (
        <OssFriendCard friend={friend} key={friend.href} />
      ))}
    </GridRoot>
  );
}
