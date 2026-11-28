'use client';

import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import {
  fontFamily,
  fontSize,
  mediaUp,
  radius,
  semanticColor,
  spacing,
} from '@/tokens';

const Card = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
`;

const Rows = styled.dl`
  display: grid;
  grid-template-columns: minmax(0, 1fr);

  ${mediaUp('sm')} {
    grid-template-columns: ${spacing(36)} minmax(0, 1fr);
  }
`;

const Key = styled.dt`
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  padding: ${spacing(3)} ${spacing(4)} 0;
  text-transform: uppercase;

  ${mediaUp('sm')} {
    border-top: 1px solid ${semanticColor.line};
    padding-bottom: ${spacing(3)};

    &:first-of-type {
      border-top: none;
    }
  }
`;

const Value = styled.dd`
  color: ${semanticColor.ink};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};
  min-width: 0;
  padding: ${spacing(1)} ${spacing(4)} ${spacing(3)};

  ${mediaUp('sm')} {
    border-top: 1px solid ${semanticColor.line};
    padding-top: ${spacing(3)};

    &:first-of-type {
      border-top: none;
    }
  }

  & a {
    color: ${semanticColor.ink};
  }

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;

const Footer = styled.p`
  border-top: 1px solid ${semanticColor.line};
  color: ${semanticColor.inkSubtle};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3)};
  padding: ${spacing(2)} ${spacing(4)};
`;

export type InfoRow = { label: string; value: ReactNode };

// Key and value rows read from the code, with the line that says so.
export function InfoCard({
  rows,
  footer,
}: {
  rows: InfoRow[];
  footer: ReactNode;
}) {
  return (
    <Card>
      <Rows>
        {rows.map((row) => (
          <InfoRowItem key={row.label} label={row.label}>
            {row.value}
          </InfoRowItem>
        ))}
      </Rows>
      <Footer>{footer}</Footer>
    </Card>
  );
}

function InfoRowItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <Key>{label}</Key>
      <Value>{children}</Value>
    </>
  );
}
