import { styled } from '@linaria/react';

import { type CaseStudyStorySection } from '@/case-studies';
import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';
import { getServerI18n } from '@/platform/i18n/get-server-i18n';
import {
  color,
  FONT_WEIGHT,
  fontFamily,
  fontSize,
  mediaUp,
  spacing,
  typeRampDeclarations,
} from '@/tokens';
import { Body, Eyebrow, Heading } from '@/ui';

const Root = styled.div`
  scroll-margin-top: ${spacing(22)};

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;

const Prose = styled.div`
  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

const Callout = styled.figure`
  border-left: 2px solid ${color('blue')};
  margin-bottom: ${spacing(2)};
  margin-top: ${spacing(6)};
  padding-left: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(4)};
  }

  ${mediaUp('md')} {
    margin-bottom: ${spacing(4)};
    margin-top: ${spacing(8)};
    padding-left: ${spacing(8)};
  }
`;

const CalloutQuote = styled.blockquote`
  ${typeRampDeclarations('headingSm')}
  color: ${color('black')};
  font-family: ${fontFamily('serif')};
  font-style: italic;
  font-weight: ${FONT_WEIGHT.light};
`;

const CalloutAttribution = styled.figcaption`
  color: ${color('black-60')};
  font-family: ${fontFamily('sans')};
  font-size: ${fontSize(3.5)};

  &::before {
    content: '— ';
  }
`;

const CalloutAttributionName = styled.span`
  color: ${color('black')};
  font-weight: ${FONT_WEIGHT.medium};
`;

export type CaseStudyTextBlockProps = {
  section: CaseStudyStorySection;
  sectionId: string;
};

export function CaseStudyTextBlock({
  section,
  sectionId,
}: CaseStudyTextBlockProps) {
  const i18n = getServerI18n();

  return (
    <Root id={sectionId}>
      <Eyebrow>{i18n._(section.eyebrow)}</Eyebrow>
      <Heading size="md" weight="light">
        {i18n._(section.heading)}
      </Heading>
      <Prose>
        {section.paragraphs.map((paragraph) => (
          <Body key={getMessageDescriptorSource(paragraph)} size="md">
            {i18n._(paragraph)}
          </Body>
        ))}
        {section.callout ? (
          <Callout>
            <CalloutQuote>
              &ldquo;{i18n._(section.callout.text)}&rdquo;
            </CalloutQuote>
            <CalloutAttribution>
              <CalloutAttributionName>
                {section.callout.author}
              </CalloutAttributionName>
              {`, ${i18n._(section.callout.role)}`}
            </CalloutAttribution>
          </Callout>
        ) : null}
      </Prose>
    </Root>
  );
}
