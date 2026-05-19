import { ArrowRightIcon } from '@/icons';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import Image from 'next/image';

const StyledFooter = styled.div<{ variant: 'default' | 'large' }>`
  align-items: center;
  border-top: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  margin-left: ${theme.spacing(6)};
  margin-right: ${theme.spacing(6)};
  padding-bottom: ${theme.spacing(5)};
  padding-top: ${theme.spacing(5)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(6)};
    margin-right: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(6)};
    padding-bottom: ${({ variant }) =>
      variant === 'large' ? '0' : theme.spacing(5)};
    padding-top: ${({ variant }) =>
      variant === 'large' ? theme.spacing(6) : theme.spacing(5)};
  }
`;

const AuthorGroup = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${theme.spacing(3)};
  min-width: 0;
`;

const AuthorAvatar = styled.div`
  align-items: center;
  background-color: ${theme.colors.highlight[100]};
  border-radius: 50%;
  color: ${theme.colors.secondary.text[100]};
  display: flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  height: 32px;
  justify-content: center;
  width: 32px;
`;

const AuthorAvatarPhoto = styled.div`
  border-radius: 50%;
  flex-shrink: 0;
  height: 32px;
  overflow: hidden;
  position: relative;
  width: 32px;
`;

const AuthorText = styled.div`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(4)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AuthorRoleText = styled.span`
  color: ${theme.colors.primary.text[40]};
`;

const ReadIconButton = styled.span`
  align-items: center;
  border: 1px solid ${theme.colors.primary.border[20]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.primary.text[80]};
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
  width: 40px;

  ${`a:hover &`} {
    transform: scale(1.08);
  }
`;

type CardFooterProps = {
  author: string;
  authorAvatarSrc?: string;
  authorRole: MessageDescriptor;
  quote?: {
    author: string;
    role: MessageDescriptor;
    text: MessageDescriptor;
  };
  variant: 'default' | 'large';
};

export function CardFooter({
  author,
  authorAvatarSrc,
  authorRole,
  quote,
  variant,
}: CardFooterProps) {
  const i18n = getServerI18n();
  const initials = author
    .split(' ')
    .map((word) => word[0])
    .join('');
  const showQuoteAuthor = variant === 'large' && quote;

  return (
    <StyledFooter variant={variant}>
      <AuthorGroup>
        {authorAvatarSrc ? (
          <AuthorAvatarPhoto>
            <Image
              alt={author}
              fill
              sizes="32px"
              src={authorAvatarSrc}
              style={{ objectFit: 'cover' }}
            />
          </AuthorAvatarPhoto>
        ) : (
          <AuthorAvatar>{initials}</AuthorAvatar>
        )}
        {showQuoteAuthor ? (
          <AuthorText>
            {quote.author}{' '}
            <AuthorRoleText>· {i18n._(quote.role)}</AuthorRoleText>
          </AuthorText>
        ) : (
          <AuthorText>
            {author} <AuthorRoleText>· {i18n._(authorRole)}</AuthorRoleText>
          </AuthorText>
        )}
      </AuthorGroup>
      <ReadIconButton aria-hidden>
        <ArrowRightIcon size={14} strokeColor="currentColor" />
      </ReadIconButton>
    </StyledFooter>
  );
}
