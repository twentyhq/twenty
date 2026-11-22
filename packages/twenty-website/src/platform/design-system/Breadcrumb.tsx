'use client';

import { styled } from '@linaria/react';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { fontFamily, fontSize, semanticColor, spacing } from '@/tokens';

const Trail = styled.nav`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.25)};
  margin-bottom: ${spacing(3)};

  & a {
    color: ${semanticColor.inkMuted};
    text-decoration: none;
  }

  & a:hover {
    color: ${semanticColor.ink};
  }
`;

export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <Trail aria-label="Breadcrumb">
      {items.map((item, position) => (
        <span key={item.label}>
          {position > 0 ? ' › ' : null}
          {item.href ? (
            <LocalizedLink href={item.href}>{item.label}</LocalizedLink>
          ) : (
            item.label
          )}
        </span>
      ))}
    </Trail>
  );
}
