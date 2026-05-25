import { Body as BaseBody } from '@/design-system/components';
import { theme } from '@/theme';
import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import { Children, type ReactNode } from 'react';

const bodyParagraphClassName = css`
  color: var(--color-text-muted);
  min-width: 0;
`;

const TwoColumnGrid = styled.div`
  column-gap: ${theme.spacing(6)};
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  margin-left: auto;
  margin-right: auto;
  max-width: 902px;
  row-gap: ${theme.spacing(6)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &[data-align='left'] {
      margin-left: 0;
    }

    &[data-align='right'] {
      margin-right: 0;
    }
  }
`;

const SingleColumnBody = styled.div`
  max-width: 556px;
  min-width: 0;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    margin-left: 384px;
    margin-right: 500px;
  }
`;

type EditorialBodyProps = {
  children: ReactNode;
  layout:
    | 'centered'
    | 'indented'
    | 'two-column'
    | 'two-column-left'
    | 'two-column-right';
};

export function Body({ children, layout }: EditorialBodyProps) {
  const paragraphs = Children.map(children, (child) => (
    <div className={bodyParagraphClassName}>
      <BaseBody
        as="p"
        family="sans"
        size="md"
        variant="body-paragraph"
        weight="regular"
      >
        {child}
      </BaseBody>
    </div>
  ));

  if (
    layout === 'two-column' ||
    layout === 'two-column-left' ||
    layout === 'two-column-right'
  ) {
    return (
      <TwoColumnGrid
        data-align={
          layout === 'two-column-right'
            ? 'right'
            : layout === 'two-column-left'
              ? 'left'
              : undefined
        }
      >
        {paragraphs}
      </TwoColumnGrid>
    );
  }

  return <SingleColumnBody>{paragraphs}</SingleColumnBody>;
}
