import { type MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import NextImage from 'next/image';

import { ArrowRight } from '@/icons';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  EASING,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  spacing,
} from '@/tokens';

import { type CaseStudyQuote } from './case-study-types';

const Footer = styled.div`
  align-items: center;
  border-top: 1px solid ${color('black-10')};
  display: flex;
  gap: ${spacing(3)};
  justify-content: space-between;
  margin-left: ${spacing(6)};
  margin-right: ${spacing(6)};
  padding-bottom: ${spacing(5)};
  padding-top: ${spacing(5)};

  ${mediaUp('md')} {
    &[data-variant='large'] {
      margin-left: 0;
      margin-right: 0;
      padding-bottom: 0;
      padding-top: ${spacing(6)};
    }
  }
`;

const AuthorGroup = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${spacing(3)};
  min-width: 0;
`;

const AuthorAvatar = styled.div`
  align-items: center;
  background-color: ${color('blue')};
  border-radius: 50%;
  color: ${color('white')};
  display: flex;
  flex-shrink: 0;
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  font-weight: ${FONT_WEIGHT.medium};
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
  color: ${color('black-80')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AuthorRoleText = styled.span`
  color: ${color('black-40')};
`;

const ReadIconButton = styled.span`
  align-items: center;
  border: 1px solid ${color('black-20')};
  border-radius: ${radius(2)};
  color: ${color('black-80')};
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  transition: transform 0.2s ${EASING.spring};
  width: 40px;

  a:hover & {
    transform: scale(1.08);
  }
`;

export type CaseStudyCardFooterProps = {
  author: string;
  authorAvatarSrc?: string;
  authorRole: MessageDescriptor;
  quote?: CaseStudyQuote;
  variant: 'default' | 'large';
};

export function CaseStudyCardFooter({
  author,
  authorAvatarSrc,
  authorRole,
  quote,
  variant,
}: CaseStudyCardFooterProps) {
  const i18n = getServerI18n();
  const initials = author
    .split(' ')
    .map((word) => word[0])
    .join('');
  const showQuoteAuthor = variant === 'large' && quote;

  return (
    <Footer data-variant={variant}>
      <AuthorGroup>
        {authorAvatarSrc ? (
          <AuthorAvatarPhoto>
            <NextImage
              alt=""
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
        <ArrowRight sizePx={14} />
      </ReadIconButton>
    </Footer>
  );
}
