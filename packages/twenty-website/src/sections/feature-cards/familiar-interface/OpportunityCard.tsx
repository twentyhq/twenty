'use client';

import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCurrencyDollar,
  IconId,
  IconProgressCheck,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { useState } from 'react';

import { RatingStar as RatingStarIcon } from '@/icons';
import { createBoundedFailureCache } from '@/platform/visuals/engine/bounded-failure-cache';
import { FONT_WEIGHT } from '@/tokens';
import { FAMILIAR_INTERFACE_SCENE } from '@/tokens/feature-scenes/familiar-interface-scene';

import {
  type FamiliarCompanyData,
  type FamiliarOpportunityCardData,
  type FamiliarPersonData,
  type FamiliarTokenTone,
} from './familiar-interface-cards-data';

const SCENE = FAMILIAR_INTERFACE_SCENE;
const TABLER_STROKE = 1.6;

// The Figma-fractional geometry the scene was authored at.
const FIGMA_CARD_WIDTH = 174.301;
const FIGMA_FIELD_HEIGHT = 22.063;
const FIGMA_FIELD_GAP = 3.677;
const FIGMA_FIELD_STACK_GAP = 1.839;
const FIGMA_CARD_RADIUS = 3.677;
const FIGMA_HEADER_PADDING_X = 5.516;
const FIGMA_HEADER_PADDING_TOP = 7.354;
const FIGMA_HEADER_PADDING_BOTTOM = 3.677;
const FIGMA_FIELDS_PADDING = 5.516;
const FIGMA_FIELDS_PADDING_BOTTOM = 3.677;
const FIGMA_CHECKBOX_SIZE = 14;
const FIGMA_ICON_BOX = 14.709;
const FIGMA_TOKEN_MARK_SIZE = 12.87;
const FIGMA_TOKEN_HEIGHT = 18.386;

const failedAvatarUrls = createBoundedFailureCache(256);
const failedLogoUrls = createBoundedFailureCache(256);

const CardRoot = styled.div<{ $variant?: 'active' | 'board' }>`
  background: ${({ $variant }) =>
    $variant === 'active'
      ? SCENE.colors.activeCardSurface
      : SCENE.colors.cardSurface};
  border: ${({ $variant }) => ($variant === 'active' ? '0.919px' : '1px')} solid
    ${({ $variant }) =>
      $variant === 'active'
        ? SCENE.colors.activeCardBorder
        : SCENE.colors.border};
  border-radius: ${FIGMA_CARD_RADIUS}px;
  box-shadow: ${SCENE.colors.cardShadow};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: background-color 120ms ease;
  width: ${FIGMA_CARD_WIDTH}px;

  &::after {
    background: ${SCENE.colors.softWash};
    content: '';
    inset: 0;
    opacity: 0;
    pointer-events: none;
    position: absolute;
    transition: opacity 120ms ease;
  }

  @media (hover: hover) {
    &:hover::after {
      opacity: ${({ $variant }) => ($variant === 'board' ? 1 : 0)};
    }
  }
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 33.095px;
  padding: ${FIGMA_HEADER_PADDING_TOP}px ${FIGMA_HEADER_PADDING_X}px
    ${FIGMA_HEADER_PADDING_BOTTOM}px;
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${FIGMA_FIELD_STACK_GAP}px;
  padding: 0 ${FIGMA_FIELDS_PADDING}px ${FIGMA_FIELDS_PADDING_BOTTOM}px
    ${FIGMA_FIELDS_PADDING}px;
`;

const FieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${FIGMA_FIELD_GAP}px;
  min-height: ${FIGMA_FIELD_HEIGHT}px;
`;

const FieldIcon = styled.div`
  align-items: center;
  color: ${SCENE.colors.textTertiary};
  display: flex;
  flex: 0 0 ${FIGMA_ICON_BOX}px;
  height: ${FIGMA_ICON_BOX}px;
  justify-content: center;
  width: ${FIGMA_ICON_BOX}px;
`;

const FieldValue = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
`;

const ValueText = styled.span`
  color: ${SCENE.colors.textPrimary};
  font-family: ${SCENE.appFont};
  font-size: 11.95px;
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CheckboxShell = styled.div`
  align-items: center;
  display: flex;
  height: ${FIGMA_FIELD_HEIGHT}px;
  justify-content: center;
  width: ${FIGMA_FIELD_HEIGHT}px;
`;

const TokenChip = styled.span<{ $soft?: boolean }>`
  align-items: center;
  background: ${({ $soft }) => ($soft ? SCENE.colors.softWash : 'transparent')};
  border-radius: 4px;
  display: inline-flex;
  gap: ${FIGMA_FIELD_GAP}px;
  height: ${FIGMA_TOKEN_HEIGHT}px;
  max-width: 100%;
  overflow: hidden;
  padding: ${({ $soft }) =>
    $soft ? '2.758px 3.677px' : '2.758px 3.677px 2.758px 0'};
`;

const HeaderTokenChip = styled.span`
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 22.063px;
  max-width: 100%;
  overflow: hidden;
  padding: 4px;
`;

const TokenMark = styled.span<{ $round?: boolean; $tone: FamiliarTokenTone }>`
  align-items: center;
  background: ${({ $tone }) => SCENE.tokenTones[$tone].background};
  border-radius: ${({ $round }) => ($round ? '999px' : '3px')};
  color: ${({ $tone }) => SCENE.tokenTones[$tone].color};
  display: inline-flex;
  flex: 0 0 auto;
  font-family: ${SCENE.appFont};
  font-size: 9.19px;
  font-weight: ${FONT_WEIGHT.medium};
  height: ${FIGMA_TOKEN_MARK_SIZE}px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: ${FIGMA_TOKEN_MARK_SIZE}px;
`;

const HeaderTokenMark = styled.span<{ $tone: FamiliarTokenTone }>`
  align-items: center;
  background: ${({ $tone }) => SCENE.tokenTones[$tone].background};
  border-radius: 2px;
  color: ${({ $tone }) => SCENE.tokenTones[$tone].color};
  display: inline-flex;
  flex: 0 0 auto;
  font-family: ${SCENE.appFont};
  font-size: 9.19px;
  font-weight: ${FONT_WEIGHT.medium};
  height: 14px;
  justify-content: center;
  overflow: hidden;
  position: relative;
  width: 14px;
`;

const TokenPhotoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const TokenLogoImage = styled.img`
  box-sizing: border-box;
  display: block;
  height: 100%;
  object-fit: contain;
  padding: 1px;
  width: 100%;
`;

const HeaderTokenLogoImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const TokenLabel = styled.span`
  color: ${SCENE.colors.textPrimary};
  font-family: ${SCENE.appFont};
  font-size: 11.95px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderTokenLabel = styled(TokenLabel)`
  font-weight: ${FONT_WEIGHT.medium};
`;

const RatingRow = styled.div`
  display: inline-flex;
  gap: 1px;
  padding: 0 3.677px;
`;

const RatingStar = styled.span`
  align-items: center;
  display: inline-flex;
  height: 12px;
  justify-content: center;
  width: 12px;
`;

function CompanyTokenMark({ company }: { company: FamiliarCompanyData }) {
  const logoUrl = company.logoSrc;
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showLogo =
    logoUrl !== undefined &&
    !failedLogoUrls.has(logoUrl) &&
    localFailedUrl !== logoUrl;

  if (showLogo) {
    return (
      <TokenMark $tone={company.squareTone}>
        <TokenLogoImage
          alt=""
          decoding="async"
          fetchPriority="low"
          loading="lazy"
          src={logoUrl}
          onError={() => {
            failedLogoUrls.add(logoUrl);
            setLocalFailedUrl(logoUrl);
          }}
        />
      </TokenMark>
    );
  }

  return <TokenMark $tone={company.squareTone}>{company.initials}</TokenMark>;
}

function HeaderCompanyTokenMark({ company }: { company: FamiliarCompanyData }) {
  const logoUrl = company.logoSrc;
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showLogo =
    logoUrl !== undefined &&
    !failedLogoUrls.has(logoUrl) &&
    localFailedUrl !== logoUrl;

  if (showLogo) {
    return (
      <HeaderTokenMark $tone={company.squareTone}>
        <HeaderTokenLogoImage
          alt=""
          decoding="async"
          fetchPriority="low"
          loading="lazy"
          src={logoUrl}
          onError={() => {
            failedLogoUrls.add(logoUrl);
            setLocalFailedUrl(logoUrl);
          }}
        />
      </HeaderTokenMark>
    );
  }

  return (
    <HeaderTokenMark $tone={company.squareTone}>
      {company.initials}
    </HeaderTokenMark>
  );
}

function PersonTokenMark({ person }: { person: FamiliarPersonData }) {
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showAvatar =
    person.avatarUrl !== undefined &&
    !failedAvatarUrls.has(person.avatarUrl) &&
    localFailedUrl !== person.avatarUrl;

  if (showAvatar) {
    return (
      <TokenMark $round $tone={person.tone}>
        <TokenPhotoImage
          alt=""
          decoding="async"
          fetchPriority="low"
          loading="lazy"
          src={person.avatarUrl}
          onError={() => {
            if (person.avatarUrl) {
              failedAvatarUrls.add(person.avatarUrl);
              setLocalFailedUrl(person.avatarUrl);
            }
          }}
        />
      </TokenMark>
    );
  }

  return (
    <TokenMark $round $tone={person.tone}>
      {person.initials}
    </TokenMark>
  );
}

function EntityChip({
  company,
  soft = true,
}: {
  company: FamiliarCompanyData;
  soft?: boolean;
}) {
  return (
    <TokenChip $soft={soft}>
      <CompanyTokenMark company={company} />
      <TokenLabel>{company.name}</TokenLabel>
    </TokenChip>
  );
}

function PersonChip({
  person,
  soft = false,
}: {
  person: FamiliarPersonData;
  soft?: boolean;
}) {
  return (
    <TokenChip $soft={soft}>
      <PersonTokenMark person={person} />
      <TokenLabel>{person.name}</TokenLabel>
    </TokenChip>
  );
}

function Rating({ rating }: { rating: number }) {
  return (
    <RatingRow>
      {Array.from({ length: 5 }, (_, index) => (
        <RatingStar key={index}>
          <RatingStarIcon
            fillColor={
              index < rating
                ? SCENE.colors.textSecondary
                : SCENE.colors.ratingEmptyStar
            }
          />
        </RatingStar>
      ))}
    </RatingRow>
  );
}

function CheckboxIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height={FIGMA_CHECKBOX_SIZE}
      viewBox="0 0 14 14"
      width={FIGMA_CHECKBOX_SIZE}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        height="12"
        rx="3"
        stroke={SCENE.colors.checkboxStroke}
        strokeWidth="1.5"
        width="12"
        x="1"
        y="1"
      />
    </svg>
  );
}

export function OpportunityPreviewCard({
  data,
  variant = 'board',
}: {
  data: FamiliarOpportunityCardData;
  variant?: 'active' | 'board';
}) {
  const iconSize = variant === 'active' ? 14.709 : 14;

  return (
    <CardRoot $variant={variant}>
      <CardHeader>
        <HeaderTokenChip>
          <HeaderCompanyTokenMark company={data.header} />
          <HeaderTokenLabel>{data.header.name}</HeaderTokenLabel>
        </HeaderTokenChip>
        <CheckboxShell>
          <CheckboxIcon />
        </CheckboxShell>
      </CardHeader>
      <CardFields>
        <FieldRow>
          <FieldIcon>
            <IconCurrencyDollar
              aria-hidden
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.amount}</ValueText>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconBuildingSkyscraper
              aria-hidden
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <EntityChip company={data.company} soft />
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconUserCircle
              aria-hidden
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <PersonChip person={data.owner} />
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconProgressCheck
              aria-hidden
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <Rating rating={data.rating} />
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconCalendarEvent
              aria-hidden
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.date}</ValueText>
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconUser aria-hidden size={iconSize} stroke={TABLER_STROKE} />
          </FieldIcon>
          <FieldValue>
            <PersonChip person={data.contact} soft />
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconId aria-hidden size={iconSize} stroke={TABLER_STROKE} />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.recordId}</ValueText>
          </FieldValue>
        </FieldRow>
      </CardFields>
    </CardRoot>
  );
}
