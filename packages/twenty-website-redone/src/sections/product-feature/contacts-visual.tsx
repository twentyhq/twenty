'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { styled } from '@linaria/react';
import { useState } from 'react';

import { useHorizontalDragScroll } from '@/platform/motion';
import { EASING } from '@/tokens';
import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const card = PRODUCT_FEATURE_SCENE.card;
const contactsScene = PRODUCT_FEATURE_SCENE.contacts;

const Root = styled.div`
  background: ${card.background};
  display: flex;
  flex-direction: column;
  font-family: ${card.font};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const ViewHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${card.border};
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 0 12px;
`;

const ViewTitle = styled.span`
  color: ${card.text};
  font-size: 13px;
  font-weight: 500;
`;

const ViewCount = styled.span`
  color: ${card.textTertiary};
  font-size: 13px;
`;

const TableShell = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const GripRail = styled.div`
  background: ${card.background};
  display: grid;
  flex: 0 0 12px;
  grid-auto-rows: 32px;
  width: 12px;
`;

const GripCell = styled.div`
  border-bottom: 1px solid ${card.border};
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
  background: ${card.background};
  border-bottom: 1px solid ${card.border};
  border-right: 1px solid ${card.border};
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
    background-color: ${contactsScene.cellHoverBackground};
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
  color: ${card.textTertiary};
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderIcon = styled.span`
  align-items: center;
  color: ${card.textTertiary};
  display: inline-flex;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
`;

const EdgePlus = styled.span`
  color: ${card.textTertiary};
  display: inline-flex;
  margin-left: auto;
`;

const Chip = styled.div`
  align-items: center;
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 4px;

  &[data-highlighted] {
    background: ${contactsScene.chipHighlightWash};
  }
`;

const ChipLabel = styled.span`
  color: ${card.text};
  font-family: ${card.font};
  font-size: 13px;
  font-weight: 400;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-bold] {
    font-weight: 500;
  }
`;

const LinkChip = styled.div`
  align-items: center;
  background: ${contactsScene.linkChipWash};
  border: 1px solid ${contactsScene.linkChipBorder};
  border-radius: 999px;
  display: inline-flex;
  gap: 4px;
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 8px;
`;

const LinkLabel = styled.span`
  color: ${card.textSecondary};
  font-family: ${card.font};
  font-size: 13px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FaviconFrame = styled.div`
  align-items: center;
  border-radius: 4px;
  display: flex;
  flex: 0 0 14px;
  height: 14px;
  justify-content: center;
  overflow: hidden;
  width: 14px;
`;

const FaviconImage = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const FaviconFallback = styled(FaviconFrame)`
  background: ${contactsScene.faviconFallbackWash};
  color: ${contactsScene.faviconFallbackInk};
  font-size: 8px;
  font-weight: 600;
`;

const PersonBadge = styled.div<{ $ink: string; $wash: string }>`
  align-items: center;
  background: ${({ $wash }) => $wash};
  border-radius: 999px;
  color: ${({ $ink }) => $ink};
  display: flex;
  flex: 0 0 14px;
  font-family: ${card.font};
  font-size: 9px;
  font-weight: 500;
  height: 14px;
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: 14px;
`;

const TagChip = styled.span`
  align-items: center;
  background: ${contactsScene.tagWash};
  border-radius: 4px;
  color: ${card.textSecondary};
  display: inline-flex;
  font-family: ${card.font};
  font-size: 13px;
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BooleanRow = styled.span`
  align-items: center;
  display: inline-flex;
  gap: 4px;
`;

const BooleanText = styled.span`
  color: ${card.textSecondary};
  font-size: 13px;
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
  border: 1px solid ${contactsScene.checkboxBorder};
  border-radius: 3px;
  display: flex;
  height: 14px;
  justify-content: center;
  transition:
    background 0.1s,
    border-color 0.1s;
  width: 14px;

  &:hover,
  &[data-checked] {
    border-color: ${contactsScene.checkboxCheckedBorder};
  }

  &[data-checked] {
    background: ${contactsScene.checkboxCheckedWash};
  }
`;

type ContactTone = keyof typeof contactsScene.personTones;

type ContactPerson = {
  name: string;
  tone: ContactTone;
};

type ContactCompany = {
  accountOwner: ContactPerson;
  address: string;
  arr: string;
  createdBy: ContactPerson;
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

// Mock fiction company rows (product-screenshot copy, English).
const COMPANIES: ContactCompany[] = [
  {
    name: 'Anthropic',
    domain: 'anthropic.com',
    createdBy: { name: 'Dario Amodei', tone: 'gray' },
    address: '18 Rue De Navarin',
    accountOwner: { name: 'Dario Amodei', tone: 'gray' },
    icp: true,
    arr: '$500,000',
    industry: 'AI Research',
  },
  {
    name: 'Linkedin',
    domain: 'linkedin.com',
    createdBy: { name: 'Reid Hoffman', tone: 'purple' },
    address: '1226 Moises Causeway',
    accountOwner: { name: 'Ryan Roslansky', tone: 'teal' },
    icp: false,
    arr: '$1,000,000',
    industry: 'Professional Networking',
  },
  {
    name: 'Slack',
    domain: 'slack.com',
    createdBy: { name: 'Stewart Butterfield', tone: 'teal' },
    address: '1316 Dameon Mountain',
    accountOwner: { name: 'Stewart Butterfield', tone: 'teal' },
    icp: true,
    arr: '$2,300,000',
    industry: 'Collaboration Software',
  },
  {
    name: 'Notion',
    domain: 'notion.com',
    createdBy: { name: 'API - Key name', tone: 'gray' },
    address: '1162 Sammy Creek',
    accountOwner: { name: 'Ivan Zhao', tone: 'gray' },
    icp: false,
    arr: '$750,000',
    industry: 'Productivity Software',
  },
  {
    name: 'Figma',
    domain: 'figma.com',
    createdBy: { name: 'Workflow name', tone: 'gray' },
    address: '110 Oswald Junction',
    accountOwner: { name: 'Dylan Field', tone: 'purple' },
    icp: true,
    arr: '$3,500,000',
    industry: 'Design Tools',
  },
  {
    name: 'Github',
    domain: 'github.com',
    createdBy: { name: 'Chris Wanstrath', tone: 'gray' },
    address: '3891 Ranchview Drive',
    accountOwner: { name: 'Thomas Dohmke', tone: 'gray' },
    icp: true,
    arr: '$900,000',
    industry: 'Developer Platform',
  },
  {
    name: 'Airbnb',
    domain: 'airbnb.com',
    createdBy: { name: 'Brian Chesky', tone: 'pink' },
    address: '888 Brannan Street',
    accountOwner: { name: 'Brian Chesky', tone: 'pink' },
    icp: false,
    arr: '$1,800,000',
    industry: 'Travel & Hospitality',
  },
  {
    name: 'Stripe',
    domain: 'stripe.com',
    createdBy: { name: 'Patrick Collison', tone: 'blue' },
    address: '354 Oyster Point Blvd',
    accountOwner: { name: 'Patrick Collison', tone: 'blue' },
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

// Authored scene artwork (mini tabler-style header glyphs, verbatim).
const HEADER_ICON_PATHS: Record<ContactColumnId, string> = {
  company: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6',
  url: 'M10 14a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-.5.5M14 10a3.5 3.5 0 0 0-5 0l-4 4a3.5 3.5 0 0 0 5 5l.5-.5',
  createdBy:
    'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0 -18 0M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855',
  address:
    'M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z',
  accountOwner:
    'M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2',
  icp: 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0',
  arr: 'M17 8V5L12 3 7 5v3M3 10a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10zM12 13v3',
  industry:
    'M4 21V11l4-4 4 4v10M12 21V7l4-4 4 4v14M8 14v.01M8 17v.01M16 11v.01M16 14v.01M16 17v.01',
};

const GRIP_CELL_COUNT = 11;

const TOTAL_WIDTH = COLUMNS.reduce((sum, column) => sum + column.width, 0);

function Favicon({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false);
  // The old site loads these favicons from the external icon service
  // (this fiction predates the shared logo registry); ported verbatim.
  const url = `https://twenty-icons.com/${domain}`;

  if (failed) {
    return <FaviconFallback>{name[0]}</FaviconFallback>;
  }

  return (
    <FaviconFrame>
      <FaviconImage
        alt={`${name} logo`}
        src={url}
        onError={() => setFailed(true)}
      />
    </FaviconFrame>
  );
}

function PersonChipBadge({ person }: { person: ContactPerson }) {
  const tone = contactsScene.personTones[person.tone];
  const initials = person.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <PersonBadge $ink={tone.color} $wash={tone.background}>
      {initials}
    </PersonBadge>
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
        <Chip data-highlighted="">
          <Favicon domain={company.domain} name={company.name} />
          <ChipLabel data-bold="">{company.name}</ChipLabel>
        </Chip>
      );
    case 'url':
      return (
        <LinkChip>
          <LinkLabel>{company.domain}</LinkLabel>
        </LinkChip>
      );
    case 'createdBy':
      return (
        <Chip>
          <PersonChipBadge person={company.createdBy} />
          <ChipLabel>{company.createdBy.name}</ChipLabel>
        </Chip>
      );
    case 'address':
      return <ChipLabel>{company.address}</ChipLabel>;
    case 'accountOwner':
      return (
        <Chip>
          <PersonChipBadge person={company.accountOwner} />
          <ChipLabel>{company.accountOwner.name}</ChipLabel>
        </Chip>
      );
    case 'icp':
      return (
        <BooleanRow>
          <svg
            fill="none"
            height="11"
            stroke={card.textSecondary}
            strokeLinecap="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="11"
          >
            {company.icp ? (
              <path d="M5 12l5 5L20 7" />
            ) : (
              <path d="M18 6L6 18M6 6l12 12" />
            )}
          </svg>
          <BooleanText>{company.icp ? 'True' : 'False'}</BooleanText>
        </BooleanRow>
      );
    case 'arr':
      return <ChipLabel>{company.arr}</ChipLabel>;
    case 'industry':
      return <TagChip>{company.industry}</TagChip>;
  }
}

const GRIP_CELLS = Array.from(
  { length: GRIP_CELL_COUNT },
  (_, gripNumber) => gripNumber,
);

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
              {COLUMNS.map((column) => (
                <Cell $width={column.width} key={column.id}>
                  <HeaderContent>
                    {column.isFirstColumn ? (
                      <CheckboxWrap aria-hidden>
                        <CheckboxBox />
                      </CheckboxWrap>
                    ) : null}
                    <HeaderIcon>
                      <svg
                        fill="none"
                        height="16"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.6"
                        viewBox="0 0 24 24"
                        width="16"
                      >
                        <path d={HEADER_ICON_PATHS[column.id]} />
                      </svg>
                    </HeaderIcon>
                    <HeaderLabel>{column.label}</HeaderLabel>
                    {column.isFirstColumn ? (
                      <EdgePlus>
                        <svg
                          fill="none"
                          height="12"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="1.6"
                          viewBox="0 0 16 16"
                          width="12"
                        >
                          <path d="M8 3v10M3 8h10" />
                        </svg>
                      </EdgePlus>
                    ) : null}
                  </HeaderContent>
                </Cell>
              ))}
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
                                <svg
                                  fill="none"
                                  height="9"
                                  viewBox="0 0 12 12"
                                  width="9"
                                >
                                  <path
                                    d="M3 6.5L5 8.5L9 4"
                                    stroke={card.accent}
                                    strokeLinecap="round"
                                    strokeWidth="1.5"
                                  />
                                </svg>
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
