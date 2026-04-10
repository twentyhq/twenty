import type { CaseStudyTextBlock } from '@/app/case-studies/_constants/types';
import { Container, Eyebrow, Heading } from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  color: ${theme.colors.primary.text[100]};
  min-width: 0;
  width: 100%;
`;

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: center;
  padding-bottom: ${theme.spacing(12)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(12)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${theme.spacing(22)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(22)};
  }
`;

const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
  max-width: 556px;
  width: 100%;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
`;

const Paragraph = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(6)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(4.5)};
    line-height: ${theme.lineHeight(6)};
  }
`;

const Callout = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  font-weight: ${theme.font.weight.medium};
  line-height: ${theme.lineHeight(7)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(5.5)};
    line-height: ${theme.lineHeight(7)};
  }
`;

type TextBlockProps = {
  block: CaseStudyTextBlock;
};

export function TextBlock({ block }: TextBlockProps) {
  return (
    <Section>
      <StyledContainer>
        <ContentWrap>
          {block.eyebrow && (
            <Eyebrow
              colorScheme="primary"
              heading={{ fontFamily: 'sans', text: block.eyebrow }}
            />
          )}

          <Heading
            as="h2"
            segments={block.heading}
            size="md"
            weight="light"
          />

          <Body>
            {block.paragraphs.map((paragraph, index) => (
              <Paragraph key={index}>{paragraph}</Paragraph>
            ))}
            {block.callout && <Callout>{block.callout}</Callout>}
          </Body>
        </ContentWrap>
      </StyledContainer>
    </Section>
  );
}
