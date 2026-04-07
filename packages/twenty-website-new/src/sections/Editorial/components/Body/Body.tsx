import { Body as BaseBody } from '@/design-system/components';
import type { BodyType } from '@/design-system/components/Body/types/Body';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const BodyParagraph = styled.div`
  color: var(--editorial-body-color);
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
  body: BodyType | BodyType[];
  layout: 'centered' | 'indented' | 'two-column';
};

export function Body({ body, layout }: EditorialBodyProps) {
  const paragraphs = Array.isArray(body) ? (
    body.map((item, index) => (
      <BodyParagraph key={index}>
        <BaseBody as="p" body={item} family="sans" size="md" weight="regular" />
      </BodyParagraph>
    ))
  ) : (
    <BodyParagraph>
      <BaseBody as="p" body={body} family="sans" size="md" weight="regular" />
    </BodyParagraph>
  );

  if (layout === 'two-column') {
    return <TwoColumnGrid>{paragraphs}</TwoColumnGrid>;
  }

  return <SingleColumnBody>{paragraphs}</SingleColumnBody>;
}
