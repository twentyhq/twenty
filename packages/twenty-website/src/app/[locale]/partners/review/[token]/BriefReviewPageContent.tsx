'use client';

import {
  SERVED_GEO_LABELS,
  SPOKEN_LANGUAGE_LABELS,
} from '@/app/[locale]/partners/list/components/chip-labels';
import { chipBaseStyles } from '@/app/[locale]/partners/list/components/chip-styles';
import { PartnerAvatar } from '@/app/[locale]/partners/list/components/PartnerAvatar';
import { PartnerChipRow } from '@/app/[locale]/partners/list/components/PartnerChipRow';
import { PartnerMoneyRow } from '@/app/[locale]/partners/list/components/PartnerMoneyRow';
import { Body } from '@/design-system/components';
import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { Logo } from '@/icons';
import { theme } from '@/theme';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { IconArrowUpRight, IconCheck } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export type Candidate = {
  applicationId: string;
  state: string;
  pitch: string | null;
  partner: {
    slug: string | null;
    name: string | null;
    introduction: string | null;
    country: string | null;
    city: string | null;
    region: string[] | null;
    languagesSpoken: string[] | null;
    skills: string[] | null;
    hourlyRateUsd: number | null;
    projectBudgetMinUsd: number | null;
    profilePictureUrl: string | null;
  } | null;
};

export type ReviewData =
  | {
      ok: true;
      brief: {
        name: string | null;
        need: string | null;
        requirements: string | null;
        status: string;
      };
      candidates: Candidate[];
      picked: string | null;
    }
  | { ok: false; reason: string };

// The chip-label maps are typed to the website's own enums; the CRM hands us the
// same string values, so widen the lookup type and let PartnerChipRow's built-in
// title-case fallback cover anything not in the map.
const GEO_LABELS = SERVED_GEO_LABELS as Record<string, MessageDescriptor>;
const LANGUAGE_LABELS = SPOKEN_LANGUAGE_LABELS as Record<
  string,
  MessageDescriptor
>;

const titleCase = (raw: string): string =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const locationLine = (
  city: string | null,
  country: string | null,
): string | null => {
  const parts = [city, country ? titleCase(country) : null].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
};

// Light-locked to match the partner-list / profile surfaces.
const Page = styled.div`
  background: var(--color-bg-muted, #f4f4f4);
  color: ${theme.colors.primary.text[100]};
  display: flex;
  flex-direction: column;
  isolation: isolate;
  min-height: 100dvh;
  position: relative;
`;

// Warm ambient wash borrowed from the partner profile page: the brand accents
// at low alpha, so the page reads as considered rather than a bare form. Inert.
const Ambient = styled.div`
  background:
    radial-gradient(58% 48% at 12% 0%, rgba(74, 56, 245, 0.1), transparent 70%),
    radial-gradient(
      52% 42% at 92% 6%,
      rgba(237, 135, 252, 0.1),
      transparent 70%
    ),
    radial-gradient(
      64% 52% at 72% 100%,
      rgba(137, 252, 154, 0.1),
      transparent 72%
    );
  inset: 0;
  pointer-events: none;
  position: fixed;
  z-index: -1;
`;

const TopBar = styled.header`
  align-items: center;
  background: ${theme.colors.primary.background[100]};
  border-bottom: 1px solid ${theme.colors.primary.border[10]};
  display: flex;
  gap: ${theme.spacing(3)};
  justify-content: space-between;
  padding: ${theme.spacing(4)} ${theme.spacing(5)};
`;

const Brand = styled.div`
  align-items: center;
  display: flex;
  gap: ${theme.spacing(2.5)};
`;

const Wordmark = styled.span`
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: -0.03em;
`;

const TopEyebrow = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(7)};
  margin: 0 auto;
  max-width: 1120px;
  padding: ${theme.spacing(10)} ${theme.spacing(5)} ${theme.spacing(16)};
  width: 100%;

  @media (min-width: ${theme.breakpoints.md}px) {
    padding: ${theme.spacing(14)} ${theme.spacing(8)} ${theme.spacing(20)};
  }
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
  max-width: 720px;
`;

const IntroEyebrow = styled.span`
  color: ${theme.colors.highlight[100]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.12em;
  text-transform: uppercase;
`;

const BriefTitle = styled.h1`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(11)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.02em;
  line-height: ${theme.lineHeight(12)};
  margin: 0;

  @media (min-width: ${theme.breakpoints.md}px) {
    font-size: ${theme.font.size(14)};
    line-height: ${theme.lineHeight(15)};
  }
`;

const Lede = styled.p`
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  line-height: 1.5;
  margin: 0;
`;

const Requirements = styled.div`
  border-left: 2px solid ${theme.colors.primary.border[20]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1.5)};
  margin-top: ${theme.spacing(1)};
  padding-left: ${theme.spacing(4)};
`;

const MetaLabel = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.75)};
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const Framing = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(5)};
  font-weight: ${theme.font.weight.light};
  line-height: 1.45;
  margin: 0;
  max-width: 720px;
`;

const Notice = styled.div`
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  color: ${theme.colors.primary.text[80]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: 1.5;
  padding: ${theme.spacing(4)} ${theme.spacing(5)};
`;

const ClosedNotice = styled(Notice)`
  background: ${theme.colors.accent.green[70]};
  border-color: transparent;
  color: ${theme.colors.primary.text[100]};
`;

// ponytail: the design system ships no error token; this is the one hardcoded
// color pair on the page, a WCAG-AA red on a soft red ground.
const ErrorNotice = styled(Notice)`
  background: #fdeceb;
  border-color: #f3c4c0;
  color: #b3261e;
`;

const Grid = styled.div`
  display: grid;
  gap: ${theme.spacing(5)};
  grid-template-columns: 1fr;

  @media (min-width: ${theme.breakpoints.md}px) {
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  }
`;

const Card = styled.article`
  background: ${theme.colors.primary.background[100]};
  border: 1px solid ${theme.colors.primary.border[10]};
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  padding: ${theme.spacing(6)};
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;

  &:hover {
    border-color: ${theme.colors.primary.border[20]};
    box-shadow: 0 16px 40px -20px rgba(0, 0, 0, 0.22);
    transform: translateY(-2px);
  }

  &[data-selected='true'] {
    border-color: ${theme.colors.primary.text[100]};
    box-shadow: 0 16px 40px -22px rgba(0, 0, 0, 0.26);
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;

const CardHeader = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${theme.spacing(3)};
`;

const HeaderText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(1)};
  min-width: 0;
`;

const CardName = styled.h2`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(7)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.02em;
  line-height: ${theme.lineHeight(8)};
  margin: 0;
`;

const LocationEyebrow = styled.span`
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const SelectedBadge = styled.span`
  align-items: center;
  background: ${theme.colors.accent.green[70]};
  border-radius: ${theme.radius(4)};
  color: ${theme.colors.primary.text[100]};
  display: inline-flex;
  flex-shrink: 0;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(1)};
  letter-spacing: 0.04em;
  padding: ${theme.spacing(1)} ${theme.spacing(2.5)};
  text-transform: uppercase;
  white-space: nowrap;
`;

const PartnerIntro = styled.p`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  color: ${theme.colors.primary.text[80]};
  display: -webkit-box;
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4)};
  line-height: 1.55;
  margin: 0;
  overflow: hidden;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(2)};
`;

const Facts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(3)};
`;

const PitchBlock = styled.div`
  background: ${theme.colors.primary.text[5]};
  border-radius: ${theme.radius(2)};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing(1.5)};
  padding: ${theme.spacing(4)};
`;

const PitchText = styled.p`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.sans};
  font-size: ${theme.font.size(4.5)};
  line-height: 1.5;
  margin: 0;
`;

const Divider = styled.hr`
  background: ${theme.colors.primary.border[10]};
  border: 0;
  height: 1px;
  margin: 0;
`;

const Actions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing(4)};
  margin-top: auto;
  padding-top: ${theme.spacing(1)};
`;

const PickButton = styled.button`
  ${buttonBaseStyles}

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const ProfileLink = styled.a`
  align-items: center;
  color: ${theme.colors.primary.text[60]};
  display: inline-flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing(1)};
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.primary.text[100]};
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 2px;
  }
`;

const CenterState = styled.main`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${theme.spacing(4)};
  justify-content: center;
  margin: 0 auto;
  max-width: 480px;
  padding: ${theme.spacing(16)} ${theme.spacing(5)};
  text-align: center;
`;

const StateTitle = styled.h1`
  color: ${theme.colors.primary.text[100]};
  font-family: ${theme.font.family.serif};
  font-size: ${theme.font.size(9)};
  font-weight: ${theme.font.weight.light};
  letter-spacing: -0.02em;
  line-height: ${theme.lineHeight(10)};
  margin: 0;
`;

const Footer = styled.footer`
  border-top: 1px solid ${theme.colors.primary.border[10]};
  color: ${theme.colors.primary.text[60]};
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(2.75)};
  letter-spacing: 0.08em;
  margin-top: auto;
  padding: ${theme.spacing(5)};
  text-align: center;
  text-transform: uppercase;
`;

function BrandBar() {
  return (
    <TopBar>
      <Brand>
        <Logo
          size={28}
          fillColor={theme.colors.secondary.text[100]}
          backgroundColor={theme.colors.secondary.background[100]}
        />
        <Wordmark>Twenty</Wordmark>
      </Brand>
      <TopEyebrow>Partner review</TopEyebrow>
    </TopBar>
  );
}

function CandidateCard({
  candidate,
  locale,
  isPicked,
  isClosed,
  saving,
  disabled,
  onPick,
}: {
  candidate: Candidate;
  locale: string;
  isPicked: boolean;
  isClosed: boolean;
  saving: boolean;
  disabled: boolean;
  onPick: (applicationId: string) => void;
}) {
  const partner = candidate.partner;
  const partnerName = partner?.name ?? 'Partner';
  const location = locationLine(
    partner?.city ?? null,
    partner?.country ?? null,
  );

  return (
    <Card data-selected={isPicked} aria-label={partnerName}>
      <CardHeader>
        <PartnerAvatar
          name={partnerName}
          slug={partner?.slug ?? partnerName}
          profilePictureUrl={partner?.profilePictureUrl ?? undefined}
        />
        <HeaderText>
          <CardName>{partnerName}</CardName>
          {location ? <LocationEyebrow>{location}</LocationEyebrow> : null}
        </HeaderText>
        {isPicked ? (
          <SelectedBadge>
            <IconCheck size={14} aria-hidden="true" />
            Selected
          </SelectedBadge>
        ) : null}
      </CardHeader>

      {partner?.introduction ? (
        <PartnerIntro>{partner.introduction}</PartnerIntro>
      ) : null}

      {partner?.skills && partner.skills.length > 0 ? (
        <Chips>
          {partner.skills.map((skill) => (
            <span key={skill} className={chipBaseStyles}>
              {skill}
            </span>
          ))}
        </Chips>
      ) : null}

      {(partner?.region && partner.region.length > 0) ||
      (partner?.languagesSpoken && partner.languagesSpoken.length > 0) ? (
        <Facts>
          {partner?.region && partner.region.length > 0 ? (
            <PartnerChipRow
              label={msg`Regions`}
              values={partner.region}
              valueLabels={GEO_LABELS}
            />
          ) : null}
          {partner?.languagesSpoken && partner.languagesSpoken.length > 0 ? (
            <PartnerChipRow
              label={msg`Languages`}
              values={partner.languagesSpoken}
              valueLabels={LANGUAGE_LABELS}
            />
          ) : null}
        </Facts>
      ) : null}

      <PartnerMoneyRow
        hourlyRateUsd={partner?.hourlyRateUsd ?? null}
        projectBudgetMinUsd={partner?.projectBudgetMinUsd ?? null}
      />

      {candidate.pitch ? (
        <PitchBlock>
          <MetaLabel>Their note on your brief</MetaLabel>
          <PitchText>{candidate.pitch}</PitchText>
        </PitchBlock>
      ) : null}

      <Divider aria-hidden="true" />

      <Actions>
        {!isPicked && !isClosed ? (
          <PickButton
            data-color="secondary"
            data-size="regular"
            data-variant="contained"
            disabled={disabled}
            onClick={() => onPick(candidate.applicationId)}
            aria-label={`Pick ${partnerName}`}
          >
            <BaseButton
              color="secondary"
              variant="contained"
              label={saving ? 'Saving…' : `Pick ${partnerName}`}
            />
          </PickButton>
        ) : null}
        {partner?.slug ? (
          <ProfileLink
            href={`/${locale}/partners/profile/${partner.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            See full profile
            <IconArrowUpRight size={14} aria-hidden="true" />
          </ProfileLink>
        ) : null}
      </Actions>
    </Card>
  );
}

export function BriefReviewPageContent({
  token,
  locale,
  data,
}: {
  token: string;
  locale: string;
  data: ReviewData;
}) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear the in-flight flag once fresh server data arrives after a pick
  // (router.refresh updates `data`), so the other cards re-enable instead of
  // staying stuck on "Saving…".
  const pickedId = data.ok ? data.picked : null;
  useEffect(() => {
    setPendingId(null);
  }, [pickedId]);

  if (!data.ok) {
    return (
      <Page>
        <Ambient aria-hidden="true" />
        <BrandBar />
        <CenterState>
          <StateTitle>This review link is no longer valid.</StateTitle>
          <Body as="p" variant="body-paragraph">
            The link may have expired or been replaced. Please ask your Twenty
            contact for an up-to-date link.
          </Body>
        </CenterState>
        <Footer>Powered by Twenty</Footer>
      </Page>
    );
  }

  const { brief, candidates, picked } = data;
  const isClosed = brief.status === 'CLOSED';
  const count = candidates.length;

  const pick = async (applicationId: string) => {
    setPendingId(applicationId);
    setError(null);
    try {
      const res = await fetch('/api/brief-pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, applicationId }),
      });
      if (!res.ok) {
        setError('We could not record your choice. Please try again.');
        setPendingId(null);
        return;
      }
      router.refresh();
    } catch {
      setError('We could not record your choice. Please try again.');
      setPendingId(null);
    }
  };

  return (
    <Page>
      <Ambient aria-hidden="true" />
      <BrandBar />
      <Main>
        <Intro>
          <IntroEyebrow>
            {isClosed ? 'Partner review' : 'Choose your partner'}
          </IntroEyebrow>
          <BriefTitle>{brief.name ?? 'Your brief'}</BriefTitle>
          {brief.need ? <Lede>{brief.need}</Lede> : null}
          {brief.requirements ? (
            <Requirements>
              <MetaLabel>Requirements</MetaLabel>
              <Body as="p" variant="body-paragraph">
                {brief.requirements}
              </Body>
            </Requirements>
          ) : null}
        </Intro>

        {isClosed ? (
          <ClosedNotice>
            A partner has been selected for this brief. This review is now
            read-only.
          </ClosedNotice>
        ) : count > 0 ? (
          <Framing>
            {count === 1 ? '1 partner' : `${count} partners`} reviewed your
            brief and want to work with you. Compare them below, then pick the
            one that fits.
          </Framing>
        ) : null}

        {count === 0 ? (
          <Notice>
            No candidates have been added to this brief yet. Check back once
            your Twenty contact has invited partners.
          </Notice>
        ) : (
          <Grid>
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.applicationId}
                candidate={candidate}
                locale={locale}
                isPicked={picked === candidate.applicationId}
                isClosed={isClosed}
                saving={pendingId === candidate.applicationId}
                disabled={pendingId !== null}
                onPick={pick}
              />
            ))}
          </Grid>
        )}

        {error ? <ErrorNotice role="alert">{error}</ErrorNotice> : null}
      </Main>
      <Footer>Powered by Twenty</Footer>
    </Page>
  );
}
