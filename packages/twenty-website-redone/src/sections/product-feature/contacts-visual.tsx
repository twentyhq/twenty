'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import {
  IconApi,
  IconBuildingFactory2,
  IconBuildingSkyscraper,
  IconCheck,
  IconLink,
  IconMapPin,
  IconMoneybag,
  IconPlus,
  IconRobot,
  IconSettingsAutomation,
  IconTarget,
  IconUser,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react';
import { useState } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { Chip } from '@/app-preview/primitives/chip';
import { FaviconLogo } from '@/app-preview/primitives/favicon-logo';
import { PersonAvatar } from '@/app-preview/primitives/person-avatar';
import { PreviewTag } from '@/app-preview/primitives/preview-tag';
import { previewFontSize } from '@/app-preview/preview-font-size';
import { useHorizontalDragScroll } from '@/platform/motion';
import { EASING } from '@/tokens';

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: ${THEME_LIGHT.font.family};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const ViewHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 0 12px;
`;

const ViewTitle = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
`;

const ViewCount = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const TableShell = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const GripRail = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: grid;
  flex: 0 0 12px;
  grid-auto-rows: 32px;
  width: 12px;
`;

const GripCell = styled.div`
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
`;

const TableViewport = styled.div`
  cursor: grab;
  flex: 1;
  min-height: 0;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  &[data-dragging] {
    cursor: grabbing;
  }
`;

const TableCanvas = styled.div<{ $width: number }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: ${({ $width }) => `${$width}px`};
  width: ${({ $width }) => `${$width}px`};
`;

const HeaderRow = styled.div`
  animation: headerIn 260ms ease-out both;
  display: flex;

  @keyframes headerIn {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Cell = styled.div<{ $width: number }>`
  align-items: center;
  background-color: ${THEME_LIGHT.background.primary};
  border-bottom: 1px solid ${THEME_LIGHT.border.color.light};
  border-right: 1px solid ${THEME_LIGHT.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: 32px;
  min-width: ${({ $width }) => `${$width}px`};
  overflow: hidden;
  padding: 0 8px;
`;

const DataRow = styled.div<{ $index: number }>`
  animation: rowIn 420ms ${EASING.standard} both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  display: flex;

  &:hover > div {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }

  @keyframes rowIn {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HeaderContent = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
  height: 100%;
  min-width: 0;
  width: 100%;
`;

const HeaderLabel = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderIcon = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.tertiary};
  display: inline-flex;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
`;

const EdgePlus = styled.span`
  color: ${THEME_LIGHT.font.color.tertiary};
  display: inline-flex;
  margin-left: auto;
`;

const CellText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BooleanRow = styled.span`
  align-items: center;
  color: ${THEME_LIGHT.font.color.primary};
  display: inline-flex;
  gap: 4px;
`;

const BooleanText = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
`;

const CheckboxWrap = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.strong};
  border-radius: 3px;
  display: flex;
  height: 14px;
  justify-content: center;
  transition:
    background-color 0.1s,
    border-color 0.1s;
  width: 14px;

  &:hover,
  &[data-checked] {
    border-color: ${THEME_LIGHT.border.color.blue};
  }

  &[data-checked] {
    background-color: ${THEME_LIGHT.background.transparent.blue};
  }
`;

type ContactTone = 'amber' | 'blue' | 'gray' | 'pink' | 'purple' | 'turquoise';

type ActorSource = 'api' | 'system' | 'workflow';

type ContactActor = {
  avatarUrl?: string;
  name: string;
  source?: ActorSource;
  tone?: ContactTone;
};

type ContactCompany = {
  accountOwner: ContactActor;
  address: string;
  arr: string;
  createdBy: ContactActor;
  domain: string;
  icp: boolean;
  industry: string;
  name: string;
};

type ContactColumnId =
  | 'accountOwner'
  | 'address'
  | 'arr'
  | 'company'
  | 'createdBy'
  | 'icp'
  | 'industry'
  | 'url';

type ContactColumn = {
  id: ContactColumnId;
  isFirstColumn?: boolean;
  label: string;
  width: number;
};

const COLUMNS: ContactColumn[] = [
  { id: 'company', label: 'Companies', width: 180, isFirstColumn: true },
  { id: 'url', label: 'Url', width: 140 },
  { id: 'createdBy', label: 'Created By', width: 150 },
  { id: 'address', label: 'Address', width: 140 },
  { id: 'accountOwner', label: 'Account Owner', width: 150 },
  { id: 'icp', label: 'ICP', width: 80 },
  { id: 'arr', label: 'ARR', width: 120 },
  { id: 'industry', label: 'Industry', width: 140 },
];

const PEOPLE = sharedAssetUrls.peopleAvatars;

// Mock fiction company rows (product-screenshot copy, English). createdBy is
// an Actor: members render their avatar, the API/workflow rows render their
// source icon, mirroring twenty-front's ActorDisplay.
const COMPANIES: ContactCompany[] = [
  {
    name: 'Anthropic',
    domain: 'anthropic.com',
    createdBy: {
      name: 'Dario Amodei',
      tone: 'gray',
      avatarUrl: PEOPLE.darioAmodei,
    },
    address: '18 Rue De Navarin',
    accountOwner: {
      name: 'Dario Amodei',
      tone: 'gray',
      avatarUrl: PEOPLE.darioAmodei,
    },
    icp: true,
    arr: '$500,000',
    industry: 'AI Research',
  },
  {
    name: 'Linkedin',
    domain: 'linkedin.com',
    createdBy: {
      name: 'Reid Hoffman',
      tone: 'purple',
      avatarUrl: PEOPLE.reidHoffman,
    },
    address: '1226 Moises Causeway',
    accountOwner: {
      name: 'Ryan Roslansky',
      tone: 'turquoise',
      avatarUrl: PEOPLE.ryanRoslansky,
    },
    icp: false,
    arr: '$1,000,000',
    industry: 'Professional Networking',
  },
  {
    name: 'Slack',
    domain: 'slack.com',
    createdBy: {
      name: 'Stewart Butterfield',
      tone: 'turquoise',
      avatarUrl: PEOPLE.stewartButterfield,
    },
    address: '1316 Dameon Mountain',
    accountOwner: {
      name: 'Stewart Butterfield',
      tone: 'turquoise',
      avatarUrl: PEOPLE.stewartButterfield,
    },
    icp: true,
    arr: '$2,300,000',
    industry: 'Collaboration Software',
  },
  {
    name: 'Notion',
    domain: 'notion.com',
    createdBy: { name: 'API - Key name', source: 'api' },
    address: '1162 Sammy Creek',
    accountOwner: {
      name: 'Ivan Zhao',
      tone: 'gray',
      avatarUrl: PEOPLE.ivanZhao,
    },
    icp: false,
    arr: '$750,000',
    industry: 'Productivity Software',
  },
  {
    name: 'Figma',
    domain: 'figma.com',
    createdBy: { name: 'Workflow name', source: 'workflow' },
    address: '110 Oswald Junction',
    accountOwner: {
      name: 'Dylan Field',
      tone: 'purple',
      avatarUrl: PEOPLE.dylanField,
    },
    icp: true,
    arr: '$3,500,000',
    industry: 'Design Tools',
  },
  {
    name: 'Github',
    domain: 'github.com',
    createdBy: {
      name: 'Chris Wanstrath',
      tone: 'gray',
      avatarUrl: PEOPLE.chrisWanstrath,
    },
    address: '3891 Ranchview Drive',
    accountOwner: {
      name: 'Thomas Dohmke',
      tone: 'gray',
      avatarUrl: PEOPLE.thomasDohmke,
    },
    icp: true,
    arr: '$900,000',
    industry: 'Developer Platform',
  },
  {
    name: 'Airbnb',
    domain: 'airbnb.com',
    createdBy: {
      name: 'Brian Chesky',
      tone: 'pink',
      avatarUrl: PEOPLE.brianChesky,
    },
    address: '888 Brannan Street',
    accountOwner: {
      name: 'Brian Chesky',
      tone: 'pink',
      avatarUrl: PEOPLE.brianChesky,
    },
    icp: false,
    arr: '$1,800,000',
    industry: 'Travel & Hospitality',
  },
  {
    name: 'Stripe',
    domain: 'stripe.com',
    createdBy: {
      name: 'Patrick Collison',
      tone: 'blue',
      avatarUrl: PEOPLE.patrickCollison,
    },
    address: '354 Oyster Point Blvd',
    accountOwner: {
      name: 'Patrick Collison',
      tone: 'blue',
      avatarUrl: PEOPLE.patrickCollison,
    },
    icp: true,
    arr: '$4,200,000',
    industry: 'Fintech',
  },
  {
    name: 'Vercel',
    domain: 'vercel.com',
    createdBy: { name: 'Guillermo Rauch', tone: 'amber' },
    address: '340 S Lemon Ave',
    accountOwner: { name: 'Guillermo Rauch', tone: 'amber' },
    icp: true,
    arr: '$620,000',
    industry: 'Developer Platform',
  },
];

// The product's column-header glyphs, by field type.
const HEADER_ICONS: Record<ContactColumnId, typeof IconUser> = {
  company: IconBuildingSkyscraper,
  url: IconLink,
  createdBy: IconUserCircle,
  address: IconMapPin,
  accountOwner: IconUser,
  icp: IconTarget,
  arr: IconMoneybag,
  industry: IconBuildingFactory2,
};

const GRIP_CELL_COUNT = 11;

const TOTAL_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0);

const GRIP_CELLS = Array.from(
  { length: GRIP_CELL_COUNT },
  (_, gripNumber) => gripNumber,
);

const ACTOR_SOURCE_ICONS = {
  api: IconApi,
  system: IconRobot,
  workflow: IconSettingsAutomation,
};

// A member shows their rounded avatar; a non-person actor (API/workflow/system)
// shows its bare source icon, inheriting the chip's text color.
function ActorAvatar({ actor }: { actor: ContactActor }) {
  if (actor.source) {
    const SourceIcon = ACTOR_SOURCE_ICONS[actor.source];
    return <SourceIcon size={14} stroke={1.6} />;
  }

  return (
    <PersonAvatar
      person={{
        avatarUrl: actor.avatarUrl,
        name: actor.name,
        tone: actor.tone,
      }}
    />
  );
}

function CellValue({
  columnId,
  company,
}: {
  columnId: ContactColumnId;
  company: ContactCompany;
}) {
  switch (columnId) {
    case 'company':
      return (
        <Chip
          isBold
          label={company.name}
          leftComponent={
            <FaviconLogo domain={company.domain} label={company.name} />
          }
          variant="highlighted"
        />
      );
    case 'url':
      return <Chip label={company.domain} variant="static" />;
    case 'createdBy':
      return (
        <Chip
          label={company.createdBy.name}
          leftComponent={<ActorAvatar actor={company.createdBy} />}
          variant="transparent"
        />
      );
    case 'address':
      return <CellText>{company.address}</CellText>;
    case 'accountOwner':
      return (
        <Chip
          label={company.accountOwner.name}
          leftComponent={<ActorAvatar actor={company.accountOwner} />}
          variant="transparent"
        />
      );
    case 'icp':
      return (
        <BooleanRow>
          {company.icp ? <IconCheck size={14} /> : <IconX size={14} />}
          <BooleanText>{company.icp ? 'True' : 'False'}</BooleanText>
        </BooleanRow>
      );
    case 'arr':
      return <CellText>{company.arr}</CellText>;
    case 'industry':
      return <PreviewTag color="gray" label={company.industry} />;
  }
}

export function ContactsVisual({ active: _active }: { active: boolean }) {
  const { i18n } = useLingui();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  } = useHorizontalDragScroll<HTMLDivElement>();

  const toggleCheck = (domain: string) => {
    setChecked((previous) => ({ ...previous, [domain]: !previous[domain] }));
  };

  const rows = COMPANIES.map((company, rowNumber) => ({ company, rowNumber }));

  return (
    <Root>
      <ViewHeader>
        <ViewTitle>All Companies</ViewTitle>
        <ViewCount>· 9</ViewCount>
      </ViewHeader>

      <TableShell>
        <GripRail>
          {GRIP_CELLS.map((gripNumber) => (
            <GripCell key={gripNumber} />
          ))}
        </GripRail>

        <TableViewport
          data-dragging={dragging ? '' : undefined}
          onPointerCancel={onPointerCancel}
          onPointerDown={onPointerDown}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          ref={viewportRef}
        >
          <TableCanvas $width={TOTAL_WIDTH}>
            <HeaderRow>
              {COLUMNS.map((column) => {
                const HeaderColumnIcon = HEADER_ICONS[column.id];

                return (
                  <Cell $width={column.width} key={column.id}>
                    <HeaderContent>
                      {column.isFirstColumn ? (
                        <CheckboxWrap aria-hidden>
                          <CheckboxBox />
                        </CheckboxWrap>
                      ) : null}
                      <HeaderIcon>
                        <HeaderColumnIcon size={16} stroke={1.6} />
                      </HeaderIcon>
                      <HeaderLabel>{column.label}</HeaderLabel>
                      {column.isFirstColumn ? (
                        <EdgePlus>
                          <IconPlus size={12} stroke={1.6} />
                        </EdgePlus>
                      ) : null}
                    </HeaderContent>
                  </Cell>
                );
              })}
            </HeaderRow>

            {rows.map(({ company, rowNumber }) => {
              const isChecked = Boolean(checked[company.domain]);

              return (
                <DataRow $index={rowNumber} key={company.domain}>
                  {COLUMNS.map((column) => (
                    <Cell $width={column.width} key={column.id}>
                      {column.isFirstColumn ? (
                        <HeaderContent>
                          <CheckboxWrap
                            aria-checked={isChecked}
                            aria-label={i18n._(msg`Select ${company.name}`)}
                            onClick={() => toggleCheck(company.domain)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                toggleCheck(company.domain);
                              }
                            }}
                            onPointerDown={(event) => event.stopPropagation()}
                            role="checkbox"
                            tabIndex={0}
                          >
                            <CheckboxBox
                              data-checked={isChecked ? '' : undefined}
                            >
                              {isChecked ? (
                                <IconCheck
                                  color={THEME_LIGHT.border.color.blue}
                                  size={9}
                                  stroke={2}
                                />
                              ) : null}
                            </CheckboxBox>
                          </CheckboxWrap>
                          <CellValue columnId={column.id} company={company} />
                        </HeaderContent>
                      ) : (
                        <CellValue columnId={column.id} company={company} />
                      )}
                    </Cell>
                  ))}
                </DataRow>
              );
            })}
          </TableCanvas>
        </TableViewport>
      </TableShell>
    </Root>
  );
}
