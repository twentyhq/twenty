'use client';

import type {
  SalesforceAddonRowType,
  SalesforcePricingPanelType,
  SalesforceRichTextPartType,
} from '@/sections/Salesforce/types';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';

const formatPriceAmount = (amount: number) =>
  `$${new Intl.NumberFormat('en-US').format(amount)}`;

const calculatePriceAmounts = (
  pricing: SalesforcePricingPanelType,
  checkedIds: ReadonlySet<string>,
) => {
  const appliedSharedCosts = new Set<string>();

  let perSeatBaseAmount = pricing.basePriceAmount;
  let fixedPriceAmount = 0;
  let netSpendRate = 0;

  for (const addon of pricing.addons) {
    if (!checkedIds.has(addon.id)) {
      continue;
    }

    if (addon.sharedCostKey && appliedSharedCosts.has(addon.sharedCostKey)) {
      fixedPriceAmount += addon.fixedCost ?? 0;
      netSpendRate += addon.netSpendRate ?? 0;
      continue;
    }

    if (addon.sharedCostKey) {
      appliedSharedCosts.add(addon.sharedCostKey);
    }

    perSeatBaseAmount += addon.cost;
    fixedPriceAmount += addon.fixedCost ?? 0;
    netSpendRate += addon.netSpendRate ?? 0;
  }

  const perSeatPriceAmount = perSeatBaseAmount * (1 + netSpendRate);
  const totalBaseAmount = perSeatBaseAmount + fixedPriceAmount;
  const totalPriceAmount = totalBaseAmount * (1 + netSpendRate);

  return {
    fixedPriceAmount,
    perSeatPriceAmount,
    totalPriceAmount,
  };
};

const PANEL_BACKGROUND = '#c9c9c9';
const CARD_STICKY_TOP_OFFSET_PX = 64;
const CARD_STICKY_BOTTOM_OFFSET_PX = 340;

type StickyHeaderMode = 'absolute' | 'fixed';

const Panel = styled.div`
  background-color: ${PANEL_BACKGROUND};
  display: flex;
  flex-direction: column;
  max-width: 672px;
  padding: 3px;
  position: relative;
  width: 100%;
`;

const StickyHeaderSpacer = styled.div<{ $height: number }>`
  height: ${({ $height }) => $height}px;
  width: 100%;
`;

const StickyHeader = styled.div<{
  $absoluteTop: number;
  $left: number;
  $mode: StickyHeaderMode;
  $width: number;
}>`
  background-color: ${PANEL_BACKGROUND};
  box-shadow:
    inset 1px 0 0 0 #dfdfdf,
    inset 2px 0 0 0 #ffffff,
    inset -1px 0 0 0 #0a0a0a,
    inset -2px 0 0 0 #808080,
    inset 0 1px 0 0 #dfdfdf,
    inset 0 2px 0 0 #ffffff;
  left: ${({ $left, $mode }) => ($mode === 'fixed' ? `${$left}px` : '0')};
  position: ${({ $mode }) => ($mode === 'fixed' ? 'fixed' : 'absolute')};
  top: ${({ $absoluteTop, $mode }) =>
    $mode === 'fixed' ? `${CARD_STICKY_TOP_OFFSET_PX}px` : `${$absoluteTop}px`};
  width: ${({ $mode, $width }) => ($mode === 'fixed' ? `${$width}px` : '100%')};
  z-index: 20;
`;

const TitleBar = styled.div`
  align-items: center;
  background: linear-gradient(90deg, #000080 0%, #1084d0 100%);
  display: flex;
  justify-content: space-between;
  padding: 3px 2px 3px 3px;
  width: 100%;
`;

const TitleBarText = styled.p`
  color: ${theme.colors.secondary.text[100]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4)};
  line-height: 12px;
  margin: 0;
`;

const TitleBarActions = styled.div`
  display: flex;
  gap: 2px;
`;

const TitleBarActionButton = styled.button`
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  color: ${theme.colors.primary.text[100]};
  cursor: pointer;
  display: flex;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(3.5)};
  justify-content: center;
  line-height: 1;
  min-height: 18px;
  min-width: 18px;
  padding: 2px 4px;

  &:active {
    box-shadow:
      inset 1px 1px 0 0 #0a0a0a,
      inset -1px -1px 0 0 #ffffff;
  }
`;

const WindowChrome = styled.div`
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #dfdfdf,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #ffffff;
  inset: 0;
  pointer-events: none;
  position: absolute;
`;

const ContentPad = styled.div`
  padding: 0 ${theme.spacing(2.75)} ${theme.spacing(2.75)};
  width: 100%;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  overflow: clip;
  padding: ${theme.spacing(4)};
  width: 100%;
`;

const SummaryPad = styled.div`
  padding: ${theme.spacing(2.75)} ${theme.spacing(2.75)} 0;
  width: 100%;
`;

const SummaryInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  padding: ${theme.spacing(4)} ${theme.spacing(4)} 0;
  width: 100%;
`;

const ProductBlock = styled.div`
  display: flex;
  flex-direction: column;
  font-family: ${theme.font.family.retro};
  gap: ${theme.spacing(4)};
  width: 100%;
`;

const ProductHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${theme.spacing(4)};
  justify-content: space-between;
  width: 100%;
`;

const ProductCopy = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  max-width: 427px;
  min-width: 0;
`;

const ProductTitle = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(14.5)};
  line-height: ${theme.spacing(14)};
  margin: 0;
`;

const PriceRow = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(1)};
  white-space: nowrap;
`;

const PriceAmount = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(12.75)};
  line-height: ${theme.spacing(10)};
`;

const PriceSuffix = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
`;

const TotalPriceRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${theme.spacing(2)};
  white-space: nowrap;
  width: 100%;
`;

const TotalPriceAmount = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-size: ${theme.font.size(8)};
  line-height: ${theme.spacing(10)};
`;

const TotalPriceLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
`;

const ProductIcon = styled.img`
  flex-shrink: 0;
  height: 92px;
  image-rendering: pixelated;
  object-fit: contain;
  width: 92px;
`;

const FakeButton = styled.a`
  align-items: center;
  background-color: rgba(28, 28, 28, 0.2);
  box-shadow:
    inset -1px -1px 0 0 #0a0a0a,
    inset 1px 1px 0 0 #ffffff,
    inset -2px -2px 0 0 #808080,
    inset 2px 2px 0 0 #dfdfdf;
  color: ${theme.colors.primary.text[100]};
  display: flex;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4)};
  justify-content: center;
  line-height: ${theme.spacing(4)};
  min-height: ${theme.spacing(10)};
  padding: ${theme.spacing(1.5)} ${theme.spacing(4.5)};
  text-decoration: none;
  width: 100%;
`;

const Separator = styled.div`
  border-top: 1px solid ${theme.colors.secondary.border[100]};
  width: 100%;
`;

const FooterNote = styled.p`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  margin: 0;
`;

const SectionLabel = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(5)};
  line-height: ${theme.spacing(6)};
  margin: 0;
`;

const AddonRow = styled.div`
  align-items: flex-start;
  display: grid;
  gap: ${theme.spacing(4)};
  grid-template-columns: minmax(0, 1fr) minmax(148px, 220px);
  width: 100%;
`;

const CheckboxLabel = styled.label<{ disabled?: boolean }>`
  align-items: flex-start;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  flex: 1;
  gap: ${theme.spacing(2)};
  min-width: 0;
  opacity: ${({ disabled }) => (disabled ? 0.55 : 1)};
`;

const HiddenCheckbox = styled.input`
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  width: 1px;
`;

const CheckboxFace = styled.span<{ checked: boolean }>`
  aspect-ratio: 1 / 1;
  background-color: ${({ checked }) =>
    checked
      ? theme.colors.primary.background[100]
      : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 0;
  box-sizing: border-box;
  box-shadow:
    inset -1.5px -1.5px 0 0 #ffffff,
    inset 1.5px 1.5px 0 0 #808080,
    inset -3px -3px 0 0 #dfdfdf,
    inset 3px 3px 0 0 #0a0a0a;
  display: block;
  flex-shrink: 0;
  height: ${theme.spacing(5.5)};
  position: relative;
  transform: ${({ checked }) => (checked ? 'scale(1.08)' : 'scale(1)')};
  transform-origin: center;
  transition:
    transform 140ms ease-out,
    background-color 140ms ease-out;
  width: ${theme.spacing(5.5)};
`;

const CheckGlyph = styled.span`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(4)};
  left: 50%;
  line-height: 1;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -55%);
`;

const AddonLabelText = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  white-space: pre-line;
`;

const AddonRightText = styled.span`
  display: block;
  font-family: ${theme.font.family.retro};
  font-size: ${theme.font.size(4.5)};
  line-height: ${theme.spacing(5.5)};
  text-align: right;
`;

const AddonRightLine = styled.span<{ 'data-muted'?: boolean }>`
  color: ${(props) =>
    props['data-muted']
      ? theme.colors.primary.text[60]
      : theme.colors.primary.text[100]};
  display: block;
`;

const AddonRightPart = styled.span`
  color: inherit;
  font: inherit;
`;

const renderRightLabelParts = (lines: SalesforceRichTextPartType[][]) =>
  lines.map((line, lineIndex) => (
    <AddonRightLine key={lineIndex} data-muted={lineIndex > 0 || undefined}>
      {line.map((part, partIndex) => (
        <AddonRightPart
          key={partIndex}
          style={
            part.strike
              ? {
                  textDecorationLine: 'line-through',
                  textDecorationThickness: '1px',
                }
              : undefined
          }
        >
          {part.text}
        </AddonRightPart>
      ))}
    </AddonRightLine>
  ));

const renderRightLabel = (label: string) =>
  label.split('\n').map((line, lineIndex) => (
    <AddonRightLine
      key={`${lineIndex}-${line}`}
      data-muted={lineIndex > 0 || undefined}
    >
      {line}
    </AddonRightLine>
  ));

export type PricingWindowProps = {
  checkedIds: ReadonlySet<string>;
  onAddonToggle: (
    addon: SalesforceAddonRowType,
    anchorRect: DOMRect | null,
  ) => void;
  onClose: () => void;
  pricing: SalesforcePricingPanelType;
};

type StickyHeaderState = {
  absoluteTop: number;
  height: number;
  left: number;
  mode: StickyHeaderMode;
  width: number;
};

export function PricingWindow({
  checkedIds,
  onAddonToggle,
  onClose,
  pricing,
}: PricingWindowProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const stickyHeaderRef = useRef<HTMLDivElement | null>(null);
  const addonAnchorRefs = useRef<Record<string, HTMLLabelElement | null>>({});
  const [stickyHeaderState, setStickyHeaderState] = useState<StickyHeaderState>(
    {
      absoluteTop: 0,
      height: 0,
      left: 0,
      mode: 'absolute',
      width: 0,
    },
  );
  const { fixedPriceAmount, perSeatPriceAmount, totalPriceAmount } =
    calculatePriceAmounts(pricing, checkedIds);

  useEffect(() => {
    let frameId = 0;

    const updateStickyHeaderState = () => {
      frameId = 0;

      const panel = panelRef.current;
      const stickyHeader = stickyHeaderRef.current;

      if (!panel || !stickyHeader) {
        return;
      }

      const panelRect = panel.getBoundingClientRect();
      const stickyHeight = stickyHeader.offsetHeight;
      const panelHeight = panel.offsetHeight;
      const panelTop = window.scrollY + panelRect.top;
      const maxAbsoluteTop = Math.max(
        0,
        panelHeight - stickyHeight - CARD_STICKY_BOTTOM_OFFSET_PX,
      );
      const fixedEndScrollY =
        panelTop +
        panelHeight -
        stickyHeight -
        CARD_STICKY_TOP_OFFSET_PX -
        CARD_STICKY_BOTTOM_OFFSET_PX;
      const nextState: StickyHeaderState =
        window.scrollY >= panelTop - CARD_STICKY_TOP_OFFSET_PX &&
        window.scrollY < fixedEndScrollY
          ? {
              absoluteTop: 0,
              height: stickyHeight,
              left: panelRect.left,
              mode: 'fixed',
              width: panelRect.width,
            }
          : {
              absoluteTop:
                window.scrollY >= fixedEndScrollY ? maxAbsoluteTop : 0,
              height: stickyHeight,
              left: 0,
              mode: 'absolute',
              width: panelRect.width,
            };

      setStickyHeaderState((previous) =>
        previous.absoluteTop === nextState.absoluteTop &&
        previous.height === nextState.height &&
        previous.left === nextState.left &&
        previous.mode === nextState.mode &&
        previous.width === nextState.width
          ? previous
          : nextState,
      );
    };

    const requestStickyHeaderUpdate = () => {
      if (frameId !== 0) {
        return;
      }

      frameId = window.requestAnimationFrame(updateStickyHeaderState);
    };

    requestStickyHeaderUpdate();

    window.addEventListener('resize', requestStickyHeaderUpdate);
    window.addEventListener('scroll', requestStickyHeaderUpdate, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(requestStickyHeaderUpdate);

    if (panelRef.current) {
      resizeObserver.observe(panelRef.current);
    }

    if (stickyHeaderRef.current) {
      resizeObserver.observe(stickyHeaderRef.current);
    }

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      window.removeEventListener('resize', requestStickyHeaderUpdate);
      window.removeEventListener('scroll', requestStickyHeaderUpdate);
    };
  }, [fixedPriceAmount]);

  return (
    <Panel ref={panelRef}>
      <WindowChrome aria-hidden="true" />
      <StickyHeaderSpacer $height={stickyHeaderState.height} />
      <StickyHeader
        $absoluteTop={stickyHeaderState.absoluteTop}
        $left={stickyHeaderState.left}
        $mode={stickyHeaderState.mode}
        $width={stickyHeaderState.width}
        ref={stickyHeaderRef}
      >
        <TitleBar>
          <TitleBarText>{pricing.windowTitle}</TitleBarText>
          <TitleBarActions>
            <TitleBarActionButton
              aria-label="Help"
              onClick={() => undefined}
              type="button"
            >
              ?
            </TitleBarActionButton>
            <TitleBarActionButton
              aria-label="Close pricing window"
              onClick={onClose}
              type="button"
            >
              ×
            </TitleBarActionButton>
          </TitleBarActions>
        </TitleBar>
        <SummaryPad>
          <SummaryInner>
            <ProductBlock>
              <ProductHeader>
                <ProductCopy>
                  <ProductTitle>{pricing.productTitle}</ProductTitle>
                  <PriceRow>
                    <PriceAmount>
                      {formatPriceAmount(perSeatPriceAmount)}
                    </PriceAmount>
                    <PriceSuffix>{pricing.priceSuffix}</PriceSuffix>
                  </PriceRow>
                  {fixedPriceAmount > 0 ? (
                    <TotalPriceRow>
                      <TotalPriceAmount>
                        {formatPriceAmount(totalPriceAmount)}
                      </TotalPriceAmount>
                      <TotalPriceLabel>
                        {pricing.totalPriceLabel}
                      </TotalPriceLabel>
                    </TotalPriceRow>
                  ) : null}
                </ProductCopy>
                <ProductIcon
                  alt={pricing.productIconAlt}
                  src={pricing.productIconSrc}
                />
              </ProductHeader>
            </ProductBlock>
            <Separator aria-hidden="true" />
          </SummaryInner>
        </SummaryPad>
      </StickyHeader>
      <ContentPad>
        <Inner>
          <SectionLabel>{pricing.featureSectionHeading}</SectionLabel>
          {pricing.addons.map((addon) => {
            const checked = checkedIds.has(addon.id);
            return (
              <AddonRow key={addon.id}>
                <CheckboxLabel
                  disabled={addon.disabled}
                  ref={(node) => {
                    addonAnchorRefs.current[addon.id] = node;
                  }}
                >
                  <HiddenCheckbox
                    checked={checked}
                    disabled={addon.disabled}
                    onChange={() =>
                      onAddonToggle(
                        addon,
                        addonAnchorRefs.current[
                          addon.id
                        ]?.getBoundingClientRect() ?? null,
                      )
                    }
                    type="checkbox"
                  />
                  <CheckboxFace checked={checked} aria-hidden="true">
                    {checked ? <CheckGlyph>✓</CheckGlyph> : null}
                  </CheckboxFace>
                  <AddonLabelText>{addon.label}</AddonLabelText>
                </CheckboxLabel>
                <AddonRightText>
                  {addon.rightLabelParts
                    ? renderRightLabelParts(addon.rightLabelParts)
                    : renderRightLabel(addon.rightLabel)}
                </AddonRightText>
              </AddonRow>
            );
          })}
          {pricing.secondaryCtaNote ? (
            <FooterNote>{pricing.secondaryCtaNote}</FooterNote>
          ) : null}
          <FakeButton
            href={pricing.secondaryCtaHref}
            rel="noreferrer"
            target="_blank"
          >
            {pricing.secondaryCtaLabel}
          </FakeButton>
        </Inner>
      </ContentPad>
    </Panel>
  );
}
