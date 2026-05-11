import { msg } from '@lingui/core/macro';
import type { CaseStudyCatalogEntry } from '@/lib/customers';
import {
  Body,
  Container,
  Eyebrow,
  Heading,
  HeadingPart,
} from '@/design-system/components';
import { PlusIcon, UsersIcon } from '@/icons';
import { getServerI18n } from '@/lib/i18n/utils/get-server-i18n';
import { LocalizedLinkButton } from '@/lib/i18n/components/LocalizedLinkButton';
import { PromoMic } from '@/sections/CaseStudyCatalog/visuals/PromoMic';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { styled } from '@linaria/react';

const CORNER_SIZE = 14;
const CORNER_OFFSET = '-7px';
const CONNECTED_TOP_OFFSET = '6px';
const LINE_INSET = '20px';
const TRUSTED_BY_BOTTOM_PADDING = 12;
const TRUSTED_BY_BOTTOM_PADDING_DESKTOP = 16;

const BODY = msg`Meet the teams who shaped Twenty into their own CRM with self-hosted deployments, AI-assisted workflows, and API-first product stacks.`;

const Section = styled.section`
  background-color: ${theme.colors.primary.background[100]};
  isolation: isolate;
  overflow: visible;
  position: relative;
  z-index: 1;
  width: 100%;
`;

const BackgroundLayer = styled.div`
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
`;

const FrameBoard = styled.div`
  display: none;
  inset: 0;
  margin: 0 auto;
  max-width: ${theme.breakpoints.maxContent}px;
  pointer-events: none;
  position: absolute;

  @media (min-width: ${theme.breakpoints.md}px) {
    display: block;
  }
`;

const Frame = styled.div<{ compactTop: boolean }>`
  bottom: ${theme.spacing(12)};
  left: ${theme.spacing(10)};
  position: absolute;
  right: ${theme.spacing(10)};
  top: ${({ compactTop }) =>
    compactTop ? CONNECTED_TOP_OFFSET : theme.spacing(12)};
`;

const FrameLine = styled.span`
  background-color: ${theme.colors.primary.border[10]};
  position: absolute;
`;

const FrameLineTop = styled(FrameLine)`
  height: 1px;
  left: ${LINE_INSET};
  right: ${LINE_INSET};
  top: 0;
`;

const FrameLineBottom = styled(FrameLine)`
  bottom: 0;
  height: 1px;
  left: ${LINE_INSET};
  right: ${LINE_INSET};
`;

const FrameLineLeft = styled(FrameLine)<{ compactTop: boolean }>`
  bottom: ${LINE_INSET};
  left: 0;
  top: ${({ compactTop }) => (compactTop ? '0' : LINE_INSET)};
  width: 1px;
`;

const FrameLineRight = styled(FrameLine)<{ compactTop: boolean }>`
  bottom: ${LINE_INSET};
  right: 0;
  top: ${({ compactTop }) => (compactTop ? '0' : LINE_INSET)};
  width: 1px;
`;

const FrameCorner = styled.span`
  align-items: center;
  display: flex;
  height: ${CORNER_SIZE}px;
  justify-content: center;
  line-height: 0;
  pointer-events: none;
  position: absolute;
  width: ${CORNER_SIZE}px;
`;

const FrameCornerTopLeft = styled(FrameCorner)`
  left: ${CORNER_OFFSET};
  top: ${CORNER_OFFSET};
`;

const FrameCornerTopRight = styled(FrameCorner)`
  right: ${CORNER_OFFSET};
  top: ${CORNER_OFFSET};
`;

const FrameCornerBottomLeft = styled(FrameCorner)`
  bottom: ${CORNER_OFFSET};
  left: ${CORNER_OFFSET};
`;

const FrameCornerBottomRight = styled(FrameCorner)`
  bottom: ${CORNER_OFFSET};
  right: ${CORNER_OFFSET};
`;

const StyledContainer = styled(Container)<{ compactTop: boolean }>`
  align-items: center;
  display: grid;
  gap: ${theme.spacing(10)};
  grid-template-columns: 1fr;
  min-height: 520px;
  padding-bottom: ${({ compactTop }) =>
    compactTop
      ? theme.spacing(16)
      : theme.spacing(24 + TRUSTED_BY_BOTTOM_PADDING)};
  padding-left: ${theme.spacing(4)};
  padding-right: ${theme.spacing(4)};
  padding-top: ${({ compactTop }) =>
    compactTop ? theme.spacing(16) : theme.spacing(20)};
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.md}px) {
    column-gap: ${theme.spacing(16)};
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
    min-height: 500px;
    padding-bottom: ${({ compactTop }) =>
      compactTop
        ? `calc(${theme.spacing(24)} + ${theme.spacing(12)} - ${CONNECTED_TOP_OFFSET})`
        : theme.spacing(40 + TRUSTED_BY_BOTTOM_PADDING_DESKTOP)};
    padding-left: ${theme.spacing(10)};
    padding-right: ${theme.spacing(10)};
    padding-top: ${({ compactTop }) =>
      compactTop ? theme.spacing(24) : theme.spacing(32)};
  }
`;

const VisualColumn = styled.div`
  align-items: center;
  display: flex;
  min-height: 360px;
  min-width: 0;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    min-height: 500px;
  }
`;

const VisualStage = styled.div`
  aspect-ratio: 1 / 1;
  margin: 0 auto;
  max-width: 480px;
  position: relative;
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 500px;
  }
`;

const MicFrame = styled.div`
  background: #f3f3f3;
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(3)};
  inset: 0;
  overflow: hidden;
  position: absolute;
  z-index: 1;
`;

const FrontMetaRow = styled.div`
  align-items: center;
  background-color: #ffffff;
  border: 1px solid ${theme.colors.primary.border[10]};
  bottom: ${theme.spacing(4)};
  display: flex;
  gap: ${theme.spacing(2)};
  left: ${theme.spacing(4)};
  padding: ${theme.spacing(2)} ${theme.spacing(3)};
  pointer-events: none;
  position: absolute;
  z-index: 2;

  @media (min-width: ${theme.breakpoints.md}px) {
    bottom: ${theme.spacing(5)};
    left: ${theme.spacing(5)};
  }
`;

const FrontTag = styled.span`
  align-items: center;
  color: ${theme.colors.primary.text[100]};
  display: inline-flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(1.5)};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const TextColumn = styled.div`
  display: grid;
  gap: ${theme.spacing(6)};
  max-width: 520px;
  min-width: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    gap: ${theme.spacing(8)};
  }
`;

const PromoBody = styled(Body)`
  @media (min-width: ${theme.breakpoints.md}px) {
    max-width: 400px;
  }
`;

const CtaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(3)};
  margin-top: ${theme.spacing(2)};
`;

type PromoProps = {
  entries: readonly CaseStudyCatalogEntry[];
  ctaHref?: string;
  ctaLabel?: MessageDescriptor;
  compactTop?: boolean;
};

export function Promo({
  entries,
  ctaHref = '/customers',
  ctaLabel = msg`Explore customer stories`,
  compactTop = false,
}: PromoProps) {
  const i18n = getServerI18n();
  return (
    <Section aria-label="Customer stories preview">
      <BackgroundLayer aria-hidden>
        <FrameBoard>
          <Frame compactTop={compactTop}>
            {!compactTop && <FrameLineTop />}
            <FrameLineBottom />
            <FrameLineLeft compactTop={compactTop} />
            <FrameLineRight compactTop={compactTop} />
            {!compactTop && (
              <>
                <FrameCornerTopLeft>
                  <PlusIcon
                    size={CORNER_SIZE}
                    strokeColor={theme.colors.highlight[100]}
                  />
                </FrameCornerTopLeft>
                <FrameCornerTopRight>
                  <PlusIcon
                    size={CORNER_SIZE}
                    strokeColor={theme.colors.highlight[100]}
                  />
                </FrameCornerTopRight>
              </>
            )}
            <FrameCornerBottomLeft>
              <PlusIcon
                size={CORNER_SIZE}
                strokeColor={theme.colors.highlight[100]}
              />
            </FrameCornerBottomLeft>
            <FrameCornerBottomRight>
              <PlusIcon
                size={CORNER_SIZE}
                strokeColor={theme.colors.highlight[100]}
              />
            </FrameCornerBottomRight>
          </Frame>
        </FrameBoard>
      </BackgroundLayer>

      <StyledContainer compactTop={compactTop}>
        <VisualColumn>
          <VisualStage>
            <MicFrame aria-hidden>
              <PromoMic />
            </MicFrame>
            {entries.length > 0 ? (
              <FrontMetaRow aria-hidden>
                <FrontTag>
                  <UsersIcon
                    size={12}
                    color={theme.colors.highlight[100]}
                    strokeWidth={1.75}
                  />
                  {entries.length} Case Studies
                </FrontTag>
              </FrontMetaRow>
            ) : null}
          </VisualStage>
        </VisualColumn>

        <TextColumn>
          <Eyebrow colorScheme="primary" markerHeight={6} markerWidth={14}>
            <HeadingPart fontFamily="mono">
              {i18n._(msg`Customer Stories`)}
            </HeadingPart>
          </Eyebrow>
          <Heading size="lg" weight="light">
            <HeadingPart fontFamily="serif">
              {i18n._(msg`How teams`)}
            </HeadingPart>
            <br />
            <HeadingPart fontFamily="sans">
              {i18n._(msg`built with Twenty`)}
            </HeadingPart>
          </Heading>
          <PromoBody size="sm">{i18n._(BODY)}</PromoBody>
          <CtaRow>
            <LocalizedLinkButton
              color="secondary"
              href={ctaHref}
              label={i18n._(ctaLabel)}
              variant="outlined"
            />
          </CtaRow>
        </TextColumn>
      </StyledContainer>
    </Section>
  );
}
