import { Body as BaseBody } from '@/design-system/components';
import type { MessageBody } from '@/lib/i18n/message-body';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';
import type { ReactNode } from 'react';

const BodyParagraph = styled.div<{ $color: string }>`
  --body-paragraph-color: ${({ $color }) => $color};
  color: ${({ $color }) => $color};
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
  body: MessageBody | MessageBody[];
  color: string;
  layout:
    | 'centered'
    | 'indented'
    | 'two-column'
    | 'two-column-left'
    | 'two-column-right';
  renderText: (descriptor: MessageDescriptor) => ReactNode;
};

export function Body({ body, color, layout, renderText }: EditorialBodyProps) {
  const paragraphs = Array.isArray(body) ? (
    body.map((item, index) => (
      <BodyParagraph $color={color} key={index}>
        <BaseBody
          as="p"
          body={item}
          family="sans"
          renderText={renderText}
          size="md"
          variant="body-paragraph"
          weight="regular"
        />
      </BodyParagraph>
    ))
  ) : (
    <BodyParagraph $color={color}>
      <BaseBody
        as="p"
        body={body}
        family="sans"
        renderText={renderText}
        size="md"
        variant="body-paragraph"
        weight="regular"
      />
    </BodyParagraph>
  );

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
