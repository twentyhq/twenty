'use client';

import { Body, Heading, HeadingPart } from '@/design-system/components';
import { PartnerIntroCalEmbed } from '@/sections/PartnerApplication/wizard/PartnerIntroCalEmbed';
import { buildPartnerIntroPrefill } from '@/sections/PartnerApplication/wizard/partner-intro-prefill';
import { theme } from '@/theme';
import { styled } from '@linaria/react';

type DialogPrimitive = React.ComponentType<{ render?: React.ReactElement }>;

type PartnerApplicationSuccessProps = {
  Title: DialogPrimitive;
  titleSerif: string;
  titleSans: string;
  subtitle: string;
  bookLaterLabel: string;
  name?: string;
  email?: string;
  company?: string;
  onDismiss: () => void;
};

const TitleHeadingWrapper = styled.div`
  color: ${theme.colors.secondary.text[100]};
`;

const SuccessView = styled.div`
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 4vh, 32px);
  margin-top: clamp(16px, 4vh, 32px);
`;

const Subtitle = styled.div`
  color: ${theme.colors.secondary.text[60]};
`;

const EmbedFrame = styled.div`
  border: 1px solid ${theme.colors.secondary.border[20]};
  border-radius: ${theme.radius(2)};
  overflow: hidden;
`;

const BookLaterButton = styled.button`
  align-self: flex-end;
  background: transparent;
  border: none;
  color: ${theme.colors.secondary.text[60]};
  cursor: pointer;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  padding: 0;
  text-transform: uppercase;
`;

export function PartnerApplicationSuccess({
  Title,
  titleSerif,
  titleSans,
  subtitle,
  bookLaterLabel,
  name,
  email,
  company,
  onDismiss,
}: PartnerApplicationSuccessProps) {
  const prefill = buildPartnerIntroPrefill({ name, email, company });

  return (
    <>
      <Title
        render={
          <TitleHeadingWrapper>
            <Heading as="h2" size="lg" weight="light">
              <HeadingPart fontFamily="serif" fontWeight="light">
                {titleSerif}
              </HeadingPart>
              <br />
              <HeadingPart fontFamily="sans" fontWeight="light">
                {titleSans}
              </HeadingPart>
            </Heading>
          </TitleHeadingWrapper>
        }
      />
      <SuccessView>
        <Subtitle>
          <Body size="md">{subtitle}</Body>
        </Subtitle>
        <EmbedFrame>
          <PartnerIntroCalEmbed
            name={prefill.name}
            email={prefill.email}
            notes={prefill.notes}
          />
        </EmbedFrame>
        <BookLaterButton type="button" onClick={onDismiss}>
          {bookLaterLabel}
        </BookLaterButton>
      </SuccessView>
    </>
  );
}
