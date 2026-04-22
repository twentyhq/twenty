import type { CaseStudyTextBlock } from '@/app/customers/_constants/types';
import {
  Body as BaseBody,
  Container,
  Eyebrow,
  Heading,
} from '@/design-system/components';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  color: ${theme.colors.primary.text[100]};
  min-width: 0;
  scroll-margin-top: ${theme.spacing(22)};
  width: 100%;
`;

const StyledContainer = styled(Container)<{ $isLast: boolean }>`
  display: flex;
  justify-content: center;
  padding-bottom: ${({ $isLast }) =>
    $isLast ? theme.spacing(20) : theme.spacing(8)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${theme.spacing(4)};

  @media (min-width: ${theme.breakpoints.md}px) {
    padding-bottom: ${({ $isLast }) =>
      $isLast ? theme.spacing(32) : theme.spacing(16)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${theme.spacing(8)};
  }
`;

const ContentWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(6)};
  max-width: 556px;
  width: 100%;
`;

const BodyStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(2)};
  margin-top: ${theme.spacing(3)};
`;

const CalloutBlock = styled.figure`
  border-left: 2px solid ${theme.colors.highlight[100]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  margin: ${theme.spacing(6)} 0 ${theme.spacing(2)};
  padding: ${theme.spacing(1)} 0 ${theme.spacing(1)} ${theme.spacing(6)};

  @media (min-width: ${theme.breakpoints.md}px) {
    margin: ${theme.spacing(8)} 0 ${theme.spacing(4)};
    padding: ${theme.spacing(2)} 0 ${theme.spacing(2)} ${theme.spacing(8)};
  }
`;

const CalloutQuote = styled.blockquote`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(6)};
  font-style: italic;
  font-weight: ${theme.font.weight.light};
  line-height: 1.35;
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(7.5)};
  }
`;

const CalloutAttribution = styled.figcaption`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(3.5)};
  font-weight: ${theme.font.weight.regular};
  line-height: ${theme.lineHeight(5)};
  margin: 0;

  &::before {
    content: '- ';
  }
`;

const CalloutAttributionName = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-weight: ${theme.font.weight.medium};
`;

function parseCallout(raw: string): { quote: string; attribution?: { name: string; rest?: string } } {
  const separator = raw.lastIndexOf(' - ');
  if (separator === -1) {
    return { quote: raw.trim().replace(/^"|"$/g, '').replace(/^"|"$/g, '') };
  }
  const quote = raw.slice(0, separator).trim().replace(/^["]|["]$/g, '');
  const attributionRaw = raw.slice(separator + 3).trim();
  const commaIndex = attributionRaw.indexOf(',');
  if (commaIndex === -1) {
    return { quote, attribution: { name: attributionRaw } };
  }
  return {
    quote,
    attribution: {
      name: attributionRaw.slice(0, commaIndex).trim(),
      rest: attributionRaw.slice(commaIndex + 1).trim(),
    },
  };
}

type TextBlockProps = {
  block: CaseStudyTextBlock;
  isLast?: boolean;
  sectionId?: string;
};

export function TextBlock({ block, isLast = false, sectionId }: TextBlockProps) {
  return (
    <Section id={sectionId}>
      <StyledContainer $isLast={isLast}>
        <ContentWrap>
          {block.eyebrow && (
            <Eyebrow
              colorScheme="primary"
              heading={{ fontFamily: 'sans', text: block.eyebrow }}
            />
          )}

          <Heading as="h2" segments={block.heading} size="md" weight="light" />

          <BodyStack>
            {block.paragraphs.map((paragraph, index) => (
              <BaseBody
                key={index}
                body={{ text: paragraph }}
                family="sans"
                size="md"
                variant="body-paragraph"
                weight="regular"
              />
            ))}
            {block.callout && (() => {
              const parsed = parseCallout(block.callout);
              return (
                <CalloutBlock>
                  <CalloutQuote>“{parsed.quote}”</CalloutQuote>
                  {parsed.attribution && (
                    <CalloutAttribution>
                      <CalloutAttributionName>
                        {parsed.attribution.name}
                      </CalloutAttributionName>
                      {parsed.attribution.rest
                        ? `, ${parsed.attribution.rest}`
                        : ''}
                    </CalloutAttribution>
                  )}
                </CalloutBlock>
              );
            })()}
          </BodyStack>
        </ContentWrap>
      </StyledContainer>
    </Section>
  );
}
