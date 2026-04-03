import { LinkButton } from '@/design-system/components';
import { stripUrlProtocol } from '@/lib/oss-friends/strip-url-protocol';
import type { OssFriend } from '@/lib/oss-friends/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import Image from 'next/image';

const ICON_BASE = 'https://twenty-icons.com';

const CardRoot = styled.article`
  background-color: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  max-width: 400px;
  min-height: 320px;
  min-width: 0;
  padding: ${theme.spacing(6)};
  row-gap: ${theme.spacing(6)};
  transition:
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 360px;
    width: 312px;
  }

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    transform: translateY(-4px);
  }
`;

const TopBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  min-width: 0;
`;

const IconSlot = styled.div`
  border-radius: ${theme.radius(1)};
  flex-shrink: 0;
  height: 28px;
  overflow: hidden;
  position: relative;
  width: 28px;
`;

const Name = styled.h2`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(8)};
  font-weight: ${theme.font.weight.medium};
  line-height: 1.2;
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(9)};
  }
`;

const Description = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4)};
  line-height: 1.55;
  margin: 0;
`;

const CtaRow = styled.div`
  width: 100%;

  & > * {
    width: 100%;
  }
`;

type OssFriendCardProps = {
  friend: OssFriend;
};

export function OssFriendCard({ friend }: OssFriendCardProps) {
  const iconSrc = `${ICON_BASE}/${stripUrlProtocol(friend.href)}`;

  return (
    <CardRoot>
      <TopBlock>
        <IconSlot>
          <Image
            alt=""
            fill
            sizes="28px"
            src={iconSrc}
            style={{ objectFit: 'cover' }}
          />
        </IconSlot>
        <Name>{friend.name}</Name>
        <Description>{friend.description}</Description>
      </TopBlock>
      <CtaRow>
        <LinkButton
          color="secondary"
          href={friend.href}
          label="Visit website"
          type="anchor"
          variant="outlined"
        />
      </CtaRow>
    </CardRoot>
  );
}
