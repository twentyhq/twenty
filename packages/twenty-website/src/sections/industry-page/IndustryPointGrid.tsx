import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  semanticColor,
  spacing,
} from '@/tokens';
import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { Body } from '@/ui';

// The Problem section's dashed point list, laid out as a grid so every
// industry section that lists parallel points reads the same way.
const Grid = styled.div`
  display: grid;
  gap: ${spacing(10)} ${spacing(8)};
  grid-template-columns: 1fr;

  ${mediaUp('md')} {
    grid-template-columns: repeat(3, 1fr);

    &[data-columns='2'] {
      grid-template-columns: repeat(2, 1fr);
    }

    &[data-columns='4'] {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`;

const Point = styled.div`
  align-content: start;
  border-top: 0.75px dashed ${semanticColor.divider};
  display: grid;
  grid-template-columns: 1fr;
  padding-top: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Kicker = styled.span`
  color: ${semanticColor.inkMuted};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  letter-spacing: 0.06em;
  text-transform: uppercase;
`;

const PointTitle = styled.h3`
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(4)};
  font-weight: ${FONT_WEIGHT.regular};
  letter-spacing: -0.04em;
  line-height: 1.35;
`;

const PointTitleLink = styled(LocalizedLink)`
  color: inherit;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
`;

export type IndustryPointGridItem = {
  body: string;
  detail?: ReactNode;
  href?: string;
  key: string;
  kicker?: string;
  title: string;
};

type IndustryPointGridProps = {
  columns?: 2 | 3 | 4;
  items: readonly IndustryPointGridItem[];
};

export function IndustryPointGrid({
  columns = 3,
  items,
}: IndustryPointGridProps) {
  return (
    <Grid data-columns={columns}>
      {items.map((item) => (
        <Point key={item.key}>
          {isDefined(item.kicker) && <Kicker>{item.kicker}</Kicker>}
          <PointTitle>
            {isDefined(item.href) ? (
              <PointTitleLink href={item.href}>{item.title}</PointTitleLink>
            ) : (
              item.title
            )}
          </PointTitle>
          <Body muted size="sm">
            {item.body}
          </Body>
          {item.detail}
        </Point>
      ))}
    </Grid>
  );
}
