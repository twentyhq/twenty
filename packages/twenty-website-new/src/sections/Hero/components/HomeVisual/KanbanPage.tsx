'use client';

import { RatingStarIcon } from '@/icons';
import { theme } from '@/theme';
import { styled } from '@linaria/react';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheck,
  IconCurrencyDollar,
  IconId,
  IconPlus,
  IconStar,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import { useState } from 'react';
import type {
  HeroCellEntity,
  HeroCellPerson,
  HeroKanbanCardType,
  HeroKanbanLaneType,
  HeroKanbanPageDefinition,
} from '../../types/HeroHomeData';
import { Chip } from './homeVisualChip';
import { VISUAL_TOKENS } from './homeVisualTokens';

const APP_FONT = VISUAL_TOKENS.font.family;
const TABLER_STROKE = 1.6;
const LANE_WIDTH = 206.4;

const COLORS = {
  accentBorder: VISUAL_TOKENS.border.color.blue,
  accentSurfaceSoft: VISUAL_TOKENS.background.transparent.blue,
  background: VISUAL_TOKENS.background.primary,
  backgroundSecondary: VISUAL_TOKENS.background.secondary,
  border: VISUAL_TOKENS.border.color.medium,
  borderLight: VISUAL_TOKENS.border.color.light,
  borderStrong: VISUAL_TOKENS.border.color.strong,
  shadow: VISUAL_TOKENS.boxShadow.light,
  text: VISUAL_TOKENS.font.color.primary,
  textLight: VISUAL_TOKENS.font.color.light,
  textSecondary: VISUAL_TOKENS.font.color.secondary,
  textTertiary: VISUAL_TOKENS.font.color.tertiary,
};

const PERSON_TONES: Record<string, { background: string; color: string }> = {
  amber: { background: '#f6e6d7', color: '#7a4f2a' },
  blue: { background: '#dbeafe', color: '#1d4ed8' },
  gray: { background: '#e5e7eb', color: '#4b5563' },
  green: { background: '#dcfce7', color: '#15803d' },
  pink: { background: '#ffe4e6', color: '#be123c' },
  purple: { background: '#ede9fe', color: '#6d28d9' },
  red: { background: '#fee2e2', color: '#b91c1c' },
  teal: { background: '#ccfbf1', color: '#0f766e' },
};

const LANE_TONES: Record<string, { background: string; color: string }> = {
  blue: { background: '#def4ff', color: '#007bb8' },
  gray: { background: '#f3f1ef', color: '#666666' },
  green: { background: '#dcf7ed', color: '#1a7f50' },
  pink: { background: '#fce5f3', color: '#d6409f' },
  purple: { background: '#ede9fe', color: '#8e4ec6' },
};

const failedAvatarUrls = new Set<string>();
const failedFaviconUrls = new Set<string>();

const BoardShell = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  scrollbar-width: none;
  width: 100%;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const BoardCanvas = styled.div<{ $laneCount: number }>`
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(
    ${({ $laneCount }) => $laneCount},
    minmax(${LANE_WIDTH}px, 1fr)
  );
  min-height: 100%;
  min-width: ${({ $laneCount }) =>
    `max(100%, ${$laneCount * LANE_WIDTH + 16}px)`};
  padding: 0 8px;
  width: 100%;
`;

const Lane = styled.div<{ $last?: boolean }>`
  border-right: ${({ $last }) =>
    $last ? 'none' : `1px solid ${COLORS.borderLight}`};
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const LaneHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 40px;
  padding: 8px;
`;

const LaneTag = styled.span<{ $background: string; $color: string }>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: 4px;
  color: ${({ $color }) => $color};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  height: 20px;
  line-height: 1.4;
  padding: 0 8px;
  white-space: nowrap;
`;

const LaneCount = styled.span`
  color: ${COLORS.textTertiary};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  white-space: nowrap;
`;

const LaneBody = styled.div`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  padding: 0 8px 8px;
`;

const Card = styled.div`
  background: ${COLORS.backgroundSecondary};
  border: 1px solid ${COLORS.border};
  border-radius: 4px;
  box-shadow: ${COLORS.shadow};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CardHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  padding: 8px 8px 4px;
`;

const CardTitle = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.medium};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CheckboxContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 24px;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  background: ${({ $checked }) =>
    $checked ? COLORS.accentSurfaceSoft : 'transparent'};
  border: 1px solid
    ${({ $checked }) => ($checked ? COLORS.accentBorder : COLORS.borderStrong)};
  border-radius: 3px;
  color: ${COLORS.textSecondary};
  display: flex;
  height: 14px;
  justify-content: center;
  width: 14px;
`;

const CardFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 8px 4px 10px;
`;

const FieldRow = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  min-height: 24px;
  width: 100%;
`;

const FieldIcon = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  display: flex;
  flex: 0 0 16px;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FieldValueWrap = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const FieldText = styled.span`
  color: ${COLORS.text};
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StarsRow = styled.div`
  align-items: center;
  display: inline-flex;
  gap: 2px;
  padding: 0 4px;
`;

const StarGlyph = styled.span`
  align-items: center;
  display: inline-flex;
  height: 12px;
  justify-content: center;
  width: 12px;
`;

const AddCardButton = styled.div`
  align-items: center;
  color: ${COLORS.textTertiary};
  display: inline-flex;
  font-family: ${APP_FONT};
  font-size: 13px;
  font-weight: ${theme.font.weight.regular};
  gap: 4px;
  height: 24px;
  line-height: 1.4;
  padding: 0 4px;
  white-space: nowrap;
`;

const PersonAvatarCircle = styled.div<{
  $background: string;
  $color: string;
  $square?: boolean;
}>`
  align-items: center;
  background: ${({ $background }) => $background};
  border-radius: ${({ $square }) => ($square ? '4px' : '999px')};
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 auto;
  font-family: ${APP_FONT};
  font-size: 10px;
  font-weight: ${theme.font.weight.medium};
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;
`;

const AvatarImage = styled.img`
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const FaviconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

function getInitials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function sanitizeURL(link: string | null | undefined) {
  return link
    ? link.replace(/(https?:\/\/)|(www\.)/g, '').replace(/\/$/, '')
    : '';
}

function getLogoUrlFromDomainName(domainName?: string): string | undefined {
  const sanitizedDomain = sanitizeURL(domainName);

  return sanitizedDomain
    ? `https://twenty-icons.com/${sanitizedDomain}`
    : undefined;
}

function FaviconLogo({
  src,
  domain,
  label,
  size = 14,
}: {
  domain?: string;
  label?: string;
  size?: number;
  src?: string;
}) {
  const faviconUrl = src ?? getLogoUrlFromDomainName(domain);
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showFavicon =
    faviconUrl !== undefined &&
    !failedFaviconUrls.has(faviconUrl) &&
    localFailedUrl !== faviconUrl;

  const baseStyle = {
    alignItems: 'center',
    borderRadius: '4px',
    display: 'flex',
    flex: '0 0 auto',
    fontFamily: APP_FONT,
    fontSize: size <= 14 ? '8px' : '9px',
    fontWeight: 600,
    height: `${size}px`,
    justifyContent: 'center',
    lineHeight: 1,
    overflow: 'hidden',
    width: `${size}px`,
  } as const;

  if (showFavicon) {
    return (
      <div style={baseStyle}>
        <FaviconImage
          alt={label ? `${label} logo` : ''}
          src={faviconUrl}
          onError={() => {
            failedFaviconUrls.add(faviconUrl);
            setLocalFailedUrl(faviconUrl);
          }}
        />
      </div>
    );
  }

  const initials = label ? getInitials(label) : '?';

  return (
    <div style={{ ...baseStyle, background: '#ebebeb', color: '#666666' }}>
      {initials.slice(0, 1)}
    </div>
  );
}

function PersonAvatarContent({ token }: { token: HeroCellPerson }) {
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showAvatar =
    token.avatarUrl !== undefined &&
    !failedAvatarUrls.has(token.avatarUrl) &&
    localFailedUrl !== token.avatarUrl;

  if (showAvatar) {
    return (
      <AvatarImage
        alt=""
        src={token.avatarUrl}
        onError={() => {
          if (token.avatarUrl) {
            failedAvatarUrls.add(token.avatarUrl);
            setLocalFailedUrl(token.avatarUrl);
          }
        }}
      />
    );
  }

  return token.shortLabel ?? getInitials(token.name);
}

function EntityChip({ entity }: { entity: HeroCellEntity }) {
  return (
    <Chip
      clickable={false}
      label={entity.name}
      leftComponent={<FaviconLogo domain={entity.domain} label={entity.name} />}
      maxWidth={152}
    />
  );
}

function PersonChip({ person }: { person: HeroCellPerson }) {
  const tone = PERSON_TONES[person.tone ?? 'gray'] ?? PERSON_TONES.gray;
  const square =
    person.kind === 'api' ||
    person.kind === 'system' ||
    person.kind === 'workflow';

  return (
    <Chip
      clickable={false}
      label={person.name}
      leftComponent={
        <PersonAvatarCircle
          $background={tone.background}
          $color={tone.color}
          $square={square}
        >
          <PersonAvatarContent token={person} />
        </PersonAvatarCircle>
      }
      maxWidth={152}
    />
  );
}

function RatingValue({ rating }: { rating: number }) {
  return (
    <StarsRow>
      {Array.from({ length: 5 }, (_, index) => (
        <StarGlyph key={index}>
          <RatingStarIcon
            fillColor={index < rating ? COLORS.textSecondary : '#d6d6d6'}
          />
        </StarGlyph>
      ))}
    </StarsRow>
  );
}

function Checkbox({ checked = false }: { checked?: boolean }) {
  return (
    <CheckboxContainer>
      <CheckboxBox $checked={checked}>
        {checked ? (
          <IconCheck
            aria-hidden
            color={COLORS.textSecondary}
            size={10}
            stroke={TABLER_STROKE}
          />
        ) : null}
      </CheckboxBox>
    </CheckboxContainer>
  );
}

function KanbanCard({ card }: { card: HeroKanbanCardType }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{card.title}</CardTitle>
        <Checkbox checked={card.checked} />
      </CardHeader>

      <CardFields>
        <FieldRow>
          <FieldIcon>
            <IconCurrencyDollar
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <FieldText>{card.amount}</FieldText>
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconBuildingSkyscraper
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <EntityChip entity={card.company} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconUserCircle
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <PersonChip person={card.accountOwner} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconStar
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <RatingValue rating={card.rating} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconCalendarEvent
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <FieldText>{card.date}</FieldText>
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconUser
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <PersonChip person={card.mainContact} />
          </FieldValueWrap>
        </FieldRow>

        <FieldRow>
          <FieldIcon>
            <IconId
              aria-hidden
              color={COLORS.textTertiary}
              size={16}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValueWrap>
            <FieldText>{card.recordId}</FieldText>
          </FieldValueWrap>
        </FieldRow>
      </CardFields>
    </Card>
  );
}

function KanbanLane({
  lane,
  isLast,
}: {
  isLast: boolean;
  lane: HeroKanbanLaneType;
}) {
  const tone = LANE_TONES[lane.tone] ?? LANE_TONES.gray;

  return (
    <Lane $last={isLast}>
      <LaneHeader>
        <LaneTag $background={tone.background} $color={tone.color}>
          {lane.label}
        </LaneTag>
        <LaneCount>{lane.cards.length}</LaneCount>
      </LaneHeader>

      <LaneBody>
        {lane.cards.map((card) => (
          <KanbanCard key={card.id} card={card} />
        ))}

        <AddCardButton aria-hidden="true">
          <IconPlus
            aria-hidden
            color={COLORS.textLight}
            size={12}
            stroke={TABLER_STROKE}
          />
          New
        </AddCardButton>
      </LaneBody>
    </Lane>
  );
}

export function KanbanPage({ page }: { page: HeroKanbanPageDefinition }) {
  return (
    <BoardShell aria-label={`Interactive preview of the ${page.header.title} board`}>
      <BoardCanvas $laneCount={page.lanes.length}>
        {page.lanes.map((lane, index) => (
          <KanbanLane
            key={lane.id}
            isLast={index === page.lanes.length - 1}
            lane={lane}
          />
        ))}
      </BoardCanvas>
    </BoardShell>
  );
}
