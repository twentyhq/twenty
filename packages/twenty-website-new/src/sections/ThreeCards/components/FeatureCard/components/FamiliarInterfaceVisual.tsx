'use client';

import { RatingStarIcon } from '@/icons';
import { WebGlMount, createBoundedFailureCache } from '@/lib/visual-runtime';
import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconChevronDown,
  IconCurrencyDollar,
  IconId,
  IconList,
  IconPlus,
  IconProgressCheck,
  IconUser,
  IconUserCircle,
} from '@tabler/icons-react';
import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useScaleToFit } from '@/sections/ThreeCards/utils/use-scale-to-fit';
import {
  INITIAL_FLOATING_CARD_ID,
  INITIAL_LANE_CARDS,
  OPPORTUNITY_CARDS,
} from '../utils/familiar-interface-cards.data';
import { FamiliarInterfaceGradientBackdrop } from './FamiliarInterfaceGradientBackdrop';

type CardId = keyof typeof OPPORTUNITY_CARDS;
type OpportunityCardData = (typeof OPPORTUNITY_CARDS)[CardId];
type CompanyData = OpportunityCardData['company'];
type PersonData = OpportunityCardData['contact'];
type LaneCards = [CardId[], CardId[]];
import {
  AddCardRow,
  BoardGroup,
  BoardSurface,
  BoardTitleCount,
  BoardTitleDot,
  BoardTitleMeta,
  BoardTitleRow,
  BoardTitleText,
  CardFields,
  CardHeader,
  CheckboxBox,
  CheckboxShell,
  COLORS,
  ColumnsGrid,
  ColumnsHeaderGrid,
  DragCursor,
  DragCursorInner,
  DraggableCardShell,
  FieldIcon,
  FieldRow,
  FieldValue,
  FIGMA_CHECKBOX_SIZE,
  HeaderTokenChip,
  HeaderTokenLabel,
  HeaderTokenLogoImage,
  HeaderTokenMark,
  InteractionLayer,
  LaneBody,
  LaneCount,
  LaneDraggableCard,
  LaneHeader,
  LanePill,
  OpportunityCard,
  RatingRow,
  RatingStar,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  SceneBackdrop,
  SceneFrame,
  SceneViewport,
  TokenChip,
  TokenLabel,
  TokenLogoImage,
  TokenMark,
  TokenPhotoImage,
  ValueText,
  ViewSwitcher,
  ViewSwitcherIcon,
  VisualRoot,
} from '../utils/familiar-interface-visual.styles';

const TABLER_STROKE = 1.6;
const CARD_DROP_ANIMATION_MS = 320;
const CARD_DROP_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const INITIAL_FLOATING_CARD_POSITION = { x: 210, y: 257 };

type LaneIndex = 0 | 1;
type CardPlacement =
  | { type: 'floating' }
  | { laneIndex: LaneIndex; type: 'lane' };
type DropTarget = { cardIndex: number; laneIndex: LaneIndex };
type FamiliarInterfaceVisualProps = {
  active?: boolean;
  backgroundImageRotationDeg?: number;
  backgroundImageSrc?: string;
  pointerTargetRef?: RefObject<HTMLElement | null>;
};

const failedAvatarUrls = createBoundedFailureCache(256);
const failedFaviconUrls = createBoundedFailureCache(256);

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function moveCardToLanePosition(
  lanes: LaneCards,
  cardId: CardId,
  targetLaneIndex: LaneIndex,
  targetCardIndex: number,
): LaneCards {
  const nextLanes = lanes.map((laneCards) =>
    laneCards.filter((laneCardId) => laneCardId !== cardId),
  ) as LaneCards;

  const boundedTargetCardIndex = clamp(
    targetCardIndex,
    0,
    nextLanes[targetLaneIndex].length,
  );

  nextLanes[targetLaneIndex] = [
    ...nextLanes[targetLaneIndex].slice(0, boundedTargetCardIndex),
    cardId,
    ...nextLanes[targetLaneIndex].slice(boundedTargetCardIndex),
  ];

  return nextLanes;
}

function CompanyTokenMark({ company }: { company: CompanyData }) {
  const logoUrl = company.logoSrc;
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showLogo =
    logoUrl !== undefined &&
    !failedFaviconUrls.has(logoUrl) &&
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
            failedFaviconUrls.add(logoUrl);
            setLocalFailedUrl(logoUrl);
          }}
        />
      </TokenMark>
    );
  }

  return <TokenMark $tone={company.squareTone}>{company.initials}</TokenMark>;
}

function HeaderCompanyTokenMark({ company }: { company: CompanyData }) {
  const logoUrl = company.logoSrc;
  const [localFailedUrl, setLocalFailedUrl] = useState<string | null>(null);
  const showLogo =
    logoUrl !== undefined &&
    !failedFaviconUrls.has(logoUrl) &&
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
            failedFaviconUrls.add(logoUrl);
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

function PersonTokenMark({ person }: { person: PersonData }) {
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
  company: CompanyData;
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
  person: PersonData;
  soft?: boolean;
}) {
  return (
    <TokenChip $soft={soft}>
      <PersonTokenMark person={person} />
      <TokenLabel>{person.name}</TokenLabel>
    </TokenChip>
  );
}

function HeaderToken({ company }: { company: CompanyData }) {
  return (
    <HeaderTokenChip>
      <HeaderCompanyTokenMark company={company} />
      <HeaderTokenLabel>{company.name}</HeaderTokenLabel>
    </HeaderTokenChip>
  );
}

function Rating({ rating }: { rating: number }) {
  return (
    <RatingRow>
      {Array.from({ length: 5 }, (_, index) => (
        <RatingStar key={index}>
          <RatingStarIcon
            fillColor={index < rating ? COLORS.textSecondary : '#d6d6d6'}
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
        stroke="#C2C2C2"
        strokeWidth="1.5"
        width="12"
        x="1"
        y="1"
      />
    </svg>
  );
}

function GrabCursorIcon({ size = 72 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#familiar-grab-cursor-shadow)">
        <path
          d="M8.38001 12.2699C8.28001 11.8999 8.18001 11.4199 7.97001 10.7199C7.76001 10.0199 7.63001 9.85994 7.50001 9.48994C7.37001 9.11994 7.20001 8.76994 7.00001 8.30994C6.81681 7.83999 6.66318 7.35906 6.54001 6.86994C6.45677 6.45774 6.55919 6.0298 6.82001 5.69994C7.17887 5.34976 7.69669 5.21649 8.18001 5.34994C8.55866 5.51553 8.87908 5.79067 9.10001 6.13994C9.39505 6.61161 9.63654 7.11472 9.82001 7.63994C10.1018 8.35957 10.3062 9.1071 10.43 9.86994L10.52 10.3199C10.52 10.3199 10.52 9.19994 10.52 9.15994C10.52 8.15994 10.46 7.33994 10.52 6.21994C10.52 6.08994 10.58 5.62994 10.6 5.49994C10.6259 5.0699 10.8821 4.68742 11.27 4.49994C11.7153 4.30015 12.2247 4.30015 12.67 4.49994C13.0686 4.67837 13.3347 5.06395 13.36 5.49994C13.36 5.60994 13.45 6.49994 13.45 6.60994C13.45 7.60994 13.45 8.24994 13.45 8.77994C13.45 9.00994 13.45 10.4099 13.45 10.2499C13.4736 8.9304 13.5872 7.614 13.79 6.30994C13.9085 5.90138 14.196 5.56295 14.58 5.37994C15.0549 5.19288 15.5945 5.28537 15.98 5.61994C16.2682 5.93623 16.4378 6.34263 16.46 6.76994C16.46 7.17994 16.46 7.66994 16.46 8.01994C16.46 8.88994 16.46 9.33994 16.46 10.1399C16.46 10.1399 16.46 10.4399 16.46 10.3199C16.55 10.0399 16.65 9.77994 16.73 9.57994C16.81 9.37994 16.97 8.96994 17.09 8.71994C17.2121 8.4816 17.3491 8.25115 17.5 8.02994C17.6568 7.77567 17.8919 7.57916 18.17 7.46994C18.4205 7.37312 18.6993 7.38109 18.9439 7.49206C19.1884 7.60304 19.378 7.80768 19.47 8.05994C19.5295 8.42419 19.5295 8.79569 19.47 9.15994C19.4033 9.71937 19.2862 10.2716 19.12 10.8099C18.99 11.2599 18.85 12.0399 18.78 12.4099C18.71 12.7799 18.55 13.7899 18.42 14.2299C18.2275 14.7548 17.9615 15.2498 17.63 15.6999C17.1448 16.2402 16.7437 16.8503 16.44 17.5099C16.3653 17.8378 16.3317 18.1737 16.34 18.5099C16.3384 18.8206 16.3788 19.1301 16.46 19.4299C16.0512 19.4735 15.6389 19.4735 15.23 19.4299C14.84 19.3699 14.36 18.5899 14.23 18.3499C14.1657 18.2211 14.034 18.1396 13.89 18.1396C13.746 18.1396 13.6143 18.2211 13.55 18.3499C13.32 18.7299 12.84 19.4199 12.5 19.4599C11.83 19.5399 10.45 19.4599 9.36001 19.4599C9.36001 19.4599 9.55001 18.4599 9.13001 18.0999C8.71001 17.7399 8.30001 17.3199 7.99001 17.0399L7.16001 16.1199C6.88001 15.7599 6.53001 15.0299 5.92001 14.1199C5.57001 13.6199 4.92001 13.0299 4.64001 12.5399C4.40493 12.1423 4.33664 11.6678 4.45001 11.2199C4.61981 10.6253 5.21067 10.2544 5.82001 10.3599C6.28351 10.3905 6.72193 10.5814 7.06001 10.8999C7.32772 11.1316 7.57837 11.3822 7.81001 11.6499C7.97001 11.8399 8.01001 11.9299 8.19001 12.1599C8.37001 12.3899 8.49001 12.6199 8.40001 12.2799"
          fill="white"
        />
        <path
          d="M8.38001 12.2699C8.28001 11.8999 8.18001 11.4199 7.97001 10.7199C7.76001 10.0199 7.63001 9.85994 7.50001 9.48994C7.37001 9.11994 7.20001 8.76994 7.00001 8.30994C6.81681 7.83999 6.66318 7.35906 6.54001 6.86994C6.45677 6.45774 6.55919 6.0298 6.82001 5.69994C7.17887 5.34976 7.69669 5.21649 8.18001 5.34994C8.55866 5.51553 8.87908 5.79067 9.10001 6.13994C9.39505 6.61161 9.63654 7.11472 9.82001 7.63994C10.1018 8.35957 10.3062 9.1071 10.43 9.86994L10.52 10.3199C10.52 10.3199 10.52 9.19994 10.52 9.15994C10.52 8.15994 10.46 7.33994 10.52 6.21994C10.52 6.08994 10.58 5.62994 10.6 5.49994C10.6259 5.0699 10.8821 4.68742 11.27 4.49994C11.7153 4.30015 12.2247 4.30015 12.67 4.49994C13.0686 4.67837 13.3347 5.06395 13.36 5.49994C13.36 5.60994 13.45 6.49994 13.45 6.60994C13.45 7.60994 13.45 8.24994 13.45 8.77994C13.45 9.00994 13.45 10.4099 13.45 10.2499C13.4736 8.9304 13.5872 7.614 13.79 6.30994C13.9085 5.90138 14.196 5.56295 14.58 5.37994C15.0549 5.19288 15.5945 5.28537 15.98 5.61994C16.2682 5.93623 16.4378 6.34263 16.46 6.76994C16.46 7.17994 16.46 7.66994 16.46 8.01994C16.46 8.88994 16.46 9.33994 16.46 10.1399C16.46 10.1399 16.46 10.4399 16.46 10.3199C16.55 10.0399 16.65 9.77994 16.73 9.57994C16.81 9.37994 16.97 8.96994 17.09 8.71994C17.2121 8.4816 17.3491 8.25115 17.5 8.02994C17.6568 7.77567 17.8919 7.57916 18.17 7.46994C18.4205 7.37312 18.6993 7.38109 18.9439 7.49206C19.1884 7.60304 19.378 7.80768 19.47 8.05994C19.5295 8.42419 19.5295 8.79569 19.47 9.15994C19.4033 9.71937 19.2862 10.2716 19.12 10.8099C18.99 11.2599 18.85 12.0399 18.78 12.4099C18.71 12.7799 18.55 13.7899 18.42 14.2299C18.2275 14.7548 17.9615 15.2498 17.63 15.6999C17.1448 16.2402 16.7437 16.8503 16.44 17.5099C16.3653 17.8378 16.3317 18.1737 16.34 18.5099C16.3384 18.8206 16.3788 19.1301 16.46 19.4299C16.0512 19.4735 15.6389 19.4735 15.23 19.4299C14.84 19.3699 14.36 18.5899 14.23 18.3499C14.1657 18.2211 14.034 18.1396 13.89 18.1396C13.746 18.1396 13.6143 18.2211 13.55 18.3499C13.32 18.7299 12.84 19.4199 12.5 19.4599C11.83 19.5399 10.45 19.4599 9.36001 19.4599C9.36001 19.4599 9.55001 18.4599 9.13001 18.0999C8.71001 17.7399 8.30001 17.3199 7.99001 17.0399L7.16001 16.1199C6.88001 15.7599 6.53001 15.0299 5.92001 14.1199C5.57001 13.6199 4.92001 13.0299 4.64001 12.5399C4.40493 12.1423 4.33664 11.6678 4.45001 11.2199C4.61981 10.6253 5.21067 10.2544 5.82001 10.3599C6.28351 10.3905 6.72193 10.5814 7.06001 10.8999C7.32772 11.1316 7.57837 11.3822 7.81001 11.6499C7.97001 11.8399 8.01001 11.9299 8.19001 12.1599C8.37001 12.3899 8.49001 12.6199 8.40001 12.2799"
          stroke="#202125"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="0.75"
        />
        <path
          d="M15.75 16.4309V12.9791C15.75 12.7725 15.5821 12.605 15.375 12.605C15.1679 12.605 15 12.7725 15 12.9791V16.4309C15 16.6375 15.1679 16.805 15.375 16.805C15.5821 16.805 15.75 16.6375 15.75 16.4309Z"
          fill="#202125"
        />
        <path
          d="M13.76 16.4307L13.75 12.9771C13.7494 12.771 13.581 12.6044 13.3739 12.605C13.1668 12.6056 12.9994 12.7732 13 12.9793L13.01 16.4328C13.0106 16.639 13.179 16.8056 13.3861 16.805C13.5932 16.8044 13.7606 16.6368 13.76 16.4307Z"
          fill="#202125"
        />
        <path
          d="M11.005 12.9798L11.025 16.4244C11.0262 16.633 11.1951 16.8011 11.4022 16.7998C11.6093 16.7986 11.7762 16.6285 11.775 16.4199L11.755 12.9753C11.7538 12.7667 11.5849 12.5986 11.3778 12.5999C11.1707 12.6011 11.0038 12.7712 11.005 12.9798Z"
          fill="#202125"
        />
      </g>
      <defs>
        <filter
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
          height="17.6955"
          id="familiar-grab-cursor-shadow"
          width="17.4682"
          x="3.22148"
          y="3.9751"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy="1" />
          <feGaussianBlur stdDeviation="0.4" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"
          />
          <feBlend
            in2="BackgroundImageFix"
            mode="normal"
            result="effect1_dropShadow_818_30937"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_818_30937"
            mode="normal"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

function OpportunityPreviewCard({
  data,
  variant = 'board',
}: {
  data: OpportunityCardData;
  variant?: 'active' | 'board';
}) {
  const iconSize = variant === 'active' ? 14.709 : 14;

  return (
    <OpportunityCard $variant={variant}>
      <CardHeader>
        <HeaderToken company={data.header} />
        <CheckboxShell>
          <CheckboxBox>
            <CheckboxIcon />
          </CheckboxBox>
        </CheckboxShell>
      </CardHeader>
      <CardFields>
        <FieldRow>
          <FieldIcon>
            <IconCurrencyDollar
              aria-hidden
              color={COLORS.textTertiary}
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
              color={COLORS.textTertiary}
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
              color={COLORS.textTertiary}
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
              color={COLORS.textTertiary}
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
              color={COLORS.textTertiary}
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
            <IconUser
              aria-hidden
              color={COLORS.textTertiary}
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <PersonChip person={data.contact} soft />
          </FieldValue>
        </FieldRow>
        <FieldRow>
          <FieldIcon>
            <IconId
              aria-hidden
              color={COLORS.textTertiary}
              size={iconSize}
              stroke={TABLER_STROKE}
            />
          </FieldIcon>
          <FieldValue>
            <ValueText>{data.recordId}</ValueText>
          </FieldValue>
        </FieldRow>
      </CardFields>
    </OpportunityCard>
  );
}

export function FamiliarInterfaceVisual({
  active = false,
  backgroundImageRotationDeg,
  backgroundImageSrc,
  pointerTargetRef,
}: FamiliarInterfaceVisualProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneFrameRef = useRef<HTMLDivElement>(null);
  const interactionLayerRef = useRef<HTMLDivElement>(null);
  const sceneScale = useScaleToFit(rootRef, SCENE_WIDTH, SCENE_HEIGHT);
  const laneBodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const laneCardRefs = useRef<Partial<Record<CardId, HTMLDivElement | null>>>(
    {},
  );
  const draggingCardShellRef = useRef<HTMLDivElement>(null);
  const pendingCardAnimationRectsRef = useRef<Partial<Record<CardId, DOMRect>>>(
    {},
  );
  const cardAnimationRefs = useRef<Partial<Record<CardId, Animation>>>({});
  const [laneCards, setLaneCards] = useState<LaneCards>(INITIAL_LANE_CARDS);
  const [floatingCardId, setFloatingCardId] = useState<CardId | null>(
    INITIAL_FLOATING_CARD_ID,
  );
  const [floatingPosition, setFloatingPosition] = useState(
    INITIAL_FLOATING_CARD_POSITION,
  );
  const [dragOffset, setDragOffset] = useState(INITIAL_FLOATING_CARD_POSITION);
  const [activeCardId, setActiveCardId] = useState<CardId | null>(null);
  const [draggedCardId, setDraggedCardId] = useState<CardId | null>(null);
  const [hasDraggedCard, setHasDraggedCard] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const activePointerIdRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    cardId: CardId;
    lastClientX: number;
    lastClientY: number;
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
    originX: number;
    originY: number;
    pointerX: number;
    pointerY: number;
    sourcePlacement: CardPlacement;
  } | null>(null);

  useLayoutEffect(() => {
    const previousCardRects = pendingCardAnimationRectsRef.current;
    const animatedCardIds = Object.keys(previousCardRects) as CardId[];

    if (animatedCardIds.length === 0) {
      return;
    }

    pendingCardAnimationRectsRef.current = {};

    for (const cardId of animatedCardIds) {
      const previousRect = previousCardRects[cardId];
      const laneCardElement = laneCardRefs.current[cardId];
      const nextRect = laneCardElement?.getBoundingClientRect();

      if (!previousRect || !laneCardElement || !nextRect) {
        continue;
      }

      const deltaX = previousRect.left - nextRect.left;
      const deltaY = previousRect.top - nextRect.top;

      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) {
        continue;
      }

      cardAnimationRefs.current[cardId]?.cancel();

      cardAnimationRefs.current[cardId] = laneCardElement.animate(
        [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: 'translate3d(0, 0, 0)' },
        ],
        {
          duration: CARD_DROP_ANIMATION_MS,
          easing: CARD_DROP_EASING,
        },
      );
    }
  }, [laneCards]);

  const captureCardAnimationRects = (draggingCardId?: CardId) => {
    const nextCardRects: Partial<Record<CardId, DOMRect>> = {};

    for (const lane of laneCards) {
      for (const laneCardId of lane) {
        if (laneCardId === draggingCardId && draggingCardShellRef.current) {
          nextCardRects[laneCardId] =
            draggingCardShellRef.current.getBoundingClientRect();
          continue;
        }

        const laneCardElement = laneCardRefs.current[laneCardId];

        if (laneCardElement) {
          nextCardRects[laneCardId] = laneCardElement.getBoundingClientRect();
        }
      }
    }

    if (
      draggingCardId &&
      nextCardRects[draggingCardId] === undefined &&
      draggingCardShellRef.current
    ) {
      nextCardRects[draggingCardId] =
        draggingCardShellRef.current.getBoundingClientRect();
    }

    pendingCardAnimationRectsRef.current = nextCardRects;
  };

  const releaseActivePointerCapture = () => {
    const activePointerId = activePointerIdRef.current;
    const interactionLayer = interactionLayerRef.current;

    if (
      activePointerId !== null &&
      interactionLayer?.hasPointerCapture(activePointerId)
    ) {
      interactionLayer.releasePointerCapture(activePointerId);
    }

    activePointerIdRef.current = null;
  };

  const clearDragState = () => {
    dragStateRef.current = null;
    setActiveCardId(null);
    setDraggedCardId(null);
    setIsDragging(false);
  };

  const updateDragOffsetFromPointer = (clientX: number, clientY: number) => {
    const currentDragState = dragStateRef.current;

    if (currentDragState === null) {
      return;
    }

    currentDragState.lastClientX = clientX;
    currentDragState.lastClientY = clientY;

    const nextX = clamp(
      currentDragState.originX + clientX - currentDragState.pointerX,
      currentDragState.minX,
      currentDragState.maxX,
    );
    const nextY = clamp(
      currentDragState.originY + clientY - currentDragState.pointerY,
      currentDragState.minY,
      currentDragState.maxY,
    );

    setDragOffset({ x: nextX, y: nextY });
  };

  const getDropTarget = (
    clientX: number,
    clientY: number,
    cardId: CardId,
  ): DropTarget | null => {
    const matchedLaneIndex = laneBodyRefs.current.findIndex((laneBody) => {
      const rect = laneBody?.getBoundingClientRect();

      return (
        rect !== undefined &&
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      );
    });

    if (matchedLaneIndex === 0 || matchedLaneIndex === 1) {
      const laneIndex = matchedLaneIndex;
      const targetLaneCards = laneCards[laneIndex].filter(
        (laneCardId) => laneCardId !== cardId,
      );

      let cardIndex = targetLaneCards.length;

      for (const [index, targetCardId] of targetLaneCards.entries()) {
        const targetCardRect =
          laneCardRefs.current[targetCardId]?.getBoundingClientRect();

        if (!targetCardRect) {
          continue;
        }

        if (clientY < targetCardRect.top + targetCardRect.height / 2) {
          cardIndex = index;
          break;
        }
      }

      return { cardIndex, laneIndex };
    }

    return null;
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    cardId: CardId,
    sourcePlacement: CardPlacement,
  ) => {
    event.preventDefault();

    const interactionLayerRect =
      interactionLayerRef.current?.getBoundingClientRect();
    const cardRect = event.currentTarget.getBoundingClientRect();

    if (!interactionLayerRect) {
      return;
    }

    if (dragStateRef.current !== null) {
      return;
    }

    setHasDraggedCard(true);
    setActiveCardId(cardId);
    setDraggedCardId(cardId);

    const originX =
      sourcePlacement.type === 'lane'
        ? cardRect.left - interactionLayerRect.left
        : floatingPosition.x;
    const originY =
      sourcePlacement.type === 'lane'
        ? cardRect.top - interactionLayerRect.top
        : floatingPosition.y;

    dragStateRef.current = {
      cardId,
      lastClientX: event.clientX,
      lastClientY: event.clientY,
      maxX: interactionLayerRect.width - cardRect.width,
      maxY: interactionLayerRect.height - cardRect.height,
      minX: 0,
      minY: 0,
      originX,
      originY,
      pointerX: event.clientX,
      pointerY: event.clientY,
      sourcePlacement,
    };
    setDragOffset({ x: originX, y: originY });
    setIsDragging(true);
    activePointerIdRef.current = event.pointerId;
    interactionLayerRef.current?.setPointerCapture(event.pointerId);
  };

  const finishDragAtPosition = (clientX: number, clientY: number) => {
    const currentDragState = dragStateRef.current;

    if (currentDragState === null) {
      return;
    }

    const releasedOffset = {
      x: clamp(
        currentDragState.originX + clientX - currentDragState.pointerX,
        currentDragState.minX,
        currentDragState.maxX,
      ),
      y: clamp(
        currentDragState.originY + clientY - currentDragState.pointerY,
        currentDragState.minY,
        currentDragState.maxY,
      ),
    };

    const dropTarget = getDropTarget(clientX, clientY, currentDragState.cardId);

    if (dropTarget !== null) {
      captureCardAnimationRects(currentDragState.cardId);

      if (currentDragState.sourcePlacement.type === 'floating') {
        setFloatingCardId(null);
        setLaneCards((currentLaneCards) =>
          moveCardToLanePosition(
            currentLaneCards,
            currentDragState.cardId,
            dropTarget.laneIndex,
            dropTarget.cardIndex,
          ),
        );
      } else {
        setLaneCards((currentLaneCards) =>
          moveCardToLanePosition(
            currentLaneCards,
            currentDragState.cardId,
            dropTarget.laneIndex,
            dropTarget.cardIndex,
          ),
        );
      }
    } else if (currentDragState.sourcePlacement.type === 'floating') {
      setFloatingPosition(releasedOffset);
    }

    clearDragState();
  };

  const handleCapturedPointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    event.preventDefault();
    updateDragOffsetFromPointer(event.clientX, event.clientY);
  };

  const handleCapturedPointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    event.preventDefault();
    finishDragAtPosition(event.clientX, event.clientY);
    releaseActivePointerCapture();
  };

  const handleCapturedPointerCancel = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.pointerId !== activePointerIdRef.current) {
      return;
    }

    event.preventDefault();

    const currentDragState = dragStateRef.current;

    if (currentDragState !== null) {
      finishDragAtPosition(
        currentDragState.lastClientX,
        currentDragState.lastClientY,
      );
    }

    releaseActivePointerCapture();
  };

  const handleLostPointerCapture = () => {
    const currentDragState = dragStateRef.current;

    if (currentDragState !== null) {
      finishDragAtPosition(
        currentDragState.lastClientX,
        currentDragState.lastClientY,
      );
    }

    activePointerIdRef.current = null;
  };

  useEffect(() => {
    return () => {
      releaseActivePointerCapture();
    };
  }, []);

  const showHandCursor =
    !hasDraggedCard && !isDragging && activeCardId === null;

  const renderLaneCard = (cardId: CardId, laneIndex: LaneIndex) => {
    const card = OPPORTUNITY_CARDS[cardId];
    const isActiveCard = activeCardId === cardId;
    const isDraggedCard = draggedCardId === cardId;

    return (
      <LaneDraggableCard
        key={cardId}
        $dragging={isDraggedCard}
        ref={(element) => {
          laneCardRefs.current[cardId] = element;
        }}
        onPointerDown={(event) => {
          handlePointerDown(event, cardId, { laneIndex, type: 'lane' });
        }}
        style={isDraggedCard ? { visibility: 'hidden' } : undefined}
      >
        <OpportunityPreviewCard
          data={card}
          variant={isActiveCard ? 'active' : 'board'}
        />
      </LaneDraggableCard>
    );
  };

  return (
    <VisualRoot aria-hidden="true" ref={rootRef}>
      <SceneViewport $sceneScale={sceneScale}>
        <SceneFrame ref={sceneFrameRef}>
          <SceneBackdrop
            $backgroundImageRotationDeg={backgroundImageRotationDeg}
          >
            <WebGlMount detachFromLayout>
              <FamiliarInterfaceGradientBackdrop
                active={active}
                imageUrl={backgroundImageSrc}
                pointerTargetRef={pointerTargetRef ?? rootRef}
              />
            </WebGlMount>
          </SceneBackdrop>
          <BoardGroup $active={active}>
            <BoardSurface>
              <BoardTitleRow>
                <ViewSwitcher>
                  <ViewSwitcherIcon>
                    <IconList
                      aria-hidden
                      color={COLORS.textSecondary}
                      size={16}
                      stroke={TABLER_STROKE}
                    />
                  </ViewSwitcherIcon>
                  <BoardTitleMeta>
                    <BoardTitleText>All opportunities</BoardTitleText>
                    <BoardTitleDot />
                    <BoardTitleCount>9</BoardTitleCount>
                  </BoardTitleMeta>
                  <IconChevronDown
                    aria-hidden
                    color={COLORS.textLight}
                    size={14}
                    stroke={TABLER_STROKE}
                  />
                </ViewSwitcher>
              </BoardTitleRow>

              <ColumnsHeaderGrid>
                <LaneHeader>
                  <LanePill $tone="pink">Identified</LanePill>
                  <LaneCount>{laneCards[0].length}</LaneCount>
                </LaneHeader>
                <LaneHeader>
                  <LanePill $tone="purple">Qualified</LanePill>
                  <LaneCount>{laneCards[1].length}</LaneCount>
                </LaneHeader>
              </ColumnsHeaderGrid>

              <ColumnsGrid>
                <LaneBody
                  ref={(element) => {
                    laneBodyRefs.current[0] = element;
                  }}
                >
                  {laneCards[0].map((cardId) => renderLaneCard(cardId, 0))}
                  <AddCardRow>
                    <IconPlus
                      aria-hidden
                      color={COLORS.textTertiary}
                      size={12}
                      stroke={TABLER_STROKE}
                    />
                    New
                  </AddCardRow>
                </LaneBody>

                <LaneBody
                  ref={(element) => {
                    laneBodyRefs.current[1] = element;
                  }}
                >
                  {laneCards[1].map((cardId) => renderLaneCard(cardId, 1))}
                  <AddCardRow>
                    <IconPlus
                      aria-hidden
                      color={COLORS.textTertiary}
                      size={12}
                      stroke={TABLER_STROKE}
                    />
                    New
                  </AddCardRow>
                </LaneBody>
              </ColumnsGrid>
            </BoardSurface>

            <InteractionLayer
              ref={interactionLayerRef}
              onLostPointerCapture={handleLostPointerCapture}
              onPointerCancel={handleCapturedPointerCancel}
              onPointerMove={handleCapturedPointerMove}
              onPointerUp={handleCapturedPointerUp}
            >
              {showHandCursor ? (
                <DragCursor $active={active}>
                  <DragCursorInner $active={active}>
                    <GrabCursorIcon size={72} />
                  </DragCursorInner>
                </DragCursor>
              ) : null}

              {floatingCardId !== null ? (
                <DraggableCardShell
                  $dragging={draggedCardId === floatingCardId}
                  data-placement="floating"
                  data-visual-hover="popover"
                  onPointerDown={(event) => {
                    handlePointerDown(event, floatingCardId, {
                      type: 'floating',
                    });
                  }}
                  style={{
                    transform: `translate3d(${floatingPosition.x}px, ${floatingPosition.y}px, 0)`,
                    visibility:
                      draggedCardId === floatingCardId ? 'hidden' : 'visible',
                  }}
                >
                  <OpportunityPreviewCard
                    data={OPPORTUNITY_CARDS[floatingCardId]}
                    variant="active"
                  />
                </DraggableCardShell>
              ) : null}

              {draggedCardId !== null ? (
                <DraggableCardShell
                  $dragging={isDragging}
                  data-placement="dragging"
                  ref={draggingCardShellRef}
                  style={{
                    transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
                  }}
                >
                  <OpportunityPreviewCard
                    data={OPPORTUNITY_CARDS[draggedCardId]}
                    variant="active"
                  />
                </DraggableCardShell>
              ) : null}
            </InteractionLayer>
          </BoardGroup>
        </SceneFrame>
      </SceneViewport>
    </VisualRoot>
  );
}
