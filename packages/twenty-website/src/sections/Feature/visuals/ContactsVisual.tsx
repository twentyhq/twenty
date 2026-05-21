'use client';

import { useHorizontalDragScroll } from '@/lib/dom/use-horizontal-drag-scroll';
import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  CARD_ACCENT,
  CARD_BG,
  CARD_BORDER,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
} from './visual-tokens';

const PERSON_TONES: Record<string, { background: string; color: string }> = {
  gray: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' },
  purple: { background: 'rgba(168,85,247,0.15)', color: '#c084fc' },
  teal: { background: 'rgba(20,184,166,0.15)', color: '#5eead4' },
  pink: { background: 'rgba(236,72,153,0.15)', color: '#f472b6' },
  blue: { background: 'rgba(59,130,246,0.15)', color: '#93c5fd' },
  amber: { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};

const Root = styled.div`
  background: ${CARD_BG};
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const ViewHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${CARD_BORDER};
  display: flex;
  gap: 4px;
  height: 34px;
  padding: 0 12px;
`;

const ViewTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 500;
`;

const ViewCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 13px;
`;

const TableShell = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const GripRail = styled.div`
  background: ${CARD_BG};
  display: grid;
  flex: 0 0 12px;
  grid-auto-rows: 32px;
  width: 12px;
`;

const GripCell = styled.div`
  border-bottom: 1px solid ${CARD_BORDER};
`;

const TableViewport = styled.div<{ $dragging: boolean }>`
  cursor: ${({ $dragging }) => ($dragging ? 'grabbing' : 'grab')};
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

const DataRow = styled.div<{ $index: number }>`
  animation: rowIn 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${({ $index }) => `${120 + $index * 70}ms`};
  display: flex;

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

const Cell = styled.div<{
  $header?: boolean;
  $hovered?: boolean;
  $width: number;
}>`
  align-items: center;
  background: ${({ $header, $hovered }) =>
    $header ? CARD_BG : $hovered ? '#25252f' : CARD_BG};
  border-bottom: 1px solid ${CARD_BORDER};
  border-right: 1px solid ${CARD_BORDER};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 ${({ $width }) => `${$width}px`};
  height: 32px;
  min-width: ${({ $width }) => `${$width}px`};
  overflow: hidden;
  padding: 0 8px;
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
  color: ${CARD_TEXT_TERTIARY};
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const HeaderIcon = styled.span`
  align-items: center;
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  flex-shrink: 0;
  height: 16px;
  width: 16px;
`;

const EdgePlus = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  display: inline-flex;
  margin-left: auto;
`;

const ChipEl = styled.div<{ $highlighted?: boolean }>`
  align-items: center;
  background: ${({ $highlighted }) =>
    $highlighted ? 'rgba(255,255,255,0.04)' : 'transparent'};
  border-radius: 4px;
  display: inline-flex;
  gap: 4px;
  height: 20px;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 0 4px;
`;

const ChipLabel = styled.span<{ $bold?: boolean }>`
  color: ${CARD_TEXT};
  font-family: ${CARD_FONT};
  font-size: 13px;
  font-weight: ${({ $bold }) => ($bold ? 500 : 400)};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LinkChip = styled.div`
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
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
  color: ${CARD_TEXT_SECONDARY};
  font-family: ${CARD_FONT};
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

const FaviconImg = styled.img`
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const FaviconFallback = styled(FaviconFrame)`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 8px;
  font-weight: 600;
`;

const AvatarEl = styled.div<{ $bg: string; $color: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border-radius: 999px;
  color: ${({ $color }) => $color};
  display: flex;
  flex: 0 0 14px;
  font-family: ${CARD_FONT};
  font-size: 9px;
  font-weight: 500;
  height: 14px;
  justify-content: center;
  line-height: 1;
  overflow: hidden;
  width: 14px;
`;

const TagChip = styled.span`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-family: ${CARD_FONT};
  font-size: 13px;
  height: 20px;
  align-items: center;
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
  color: ${CARD_TEXT_SECONDARY};
  font-size: 13px;
`;

const CheckboxWrap = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  height: 24px;
  justify-content: center;
  width: 24px;
`;

const CheckboxBox = styled.div<{ $checked?: boolean }>`
  align-items: center;
  border: 1px solid
    ${({ $checked }) =>
      $checked ? 'rgba(62,99,221,0.5)' : 'rgba(255,255,255,0.15)'};
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  height: 14px;
  justify-content: center;
  transition:
    background 0.1s,
    border-color 0.1s;
  width: 14px;

  background: ${({ $checked }) =>
    $checked ? 'rgba(62,99,221,0.12)' : 'transparent'};

  &:hover {
    border-color: rgba(62, 99, 221, 0.5);
  }
`;

const COLUMNS = [
  { id: 'company', label: 'Companies', width: 180, isFirst: true },
  { id: 'url', label: 'Url', width: 140 },
  { id: 'createdBy', label: 'Created By', width: 150 },
  { id: 'address', label: 'Address', width: 140 },
  { id: 'accountOwner', label: 'Account Owner', width: 150 },
  { id: 'icp', label: 'ICP', width: 80 },
  { id: 'arr', label: 'ARR', width: 120 },
  { id: 'industry', label: 'Industry', width: 140 },
];

const COMPANIES = [
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

const HEADER_ICON_PATHS: Record<string, string> = {
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

function Favicon({ domain, name }: { domain: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const url = `https://twenty-icons.com/${domain}`;

  if (failed) {
    return <FaviconFallback>{name[0]}</FaviconFallback>;
  }

  return (
    <FaviconFrame>
      <FaviconImg
        alt={`${name} logo`}
        src={url}
        onError={() => setFailed(true)}
      />
    </FaviconFrame>
  );
}

function Avatar({ name, tone }: { name: string; tone: string }) {
  const resolved = PERSON_TONES[tone] ?? PERSON_TONES.gray;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <AvatarEl $bg={resolved.background} $color={resolved.color}>
      {initials}
    </AvatarEl>
  );
}

type ContactsVisualProps = {
  active: boolean;
};

export function ContactsVisual({ active: _active }: ContactsVisualProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const {
    dragging,
    onPointerCancel,
    onPointerDown,
    onPointerLeave,
    onPointerMove,
    onPointerUp,
    viewportRef,
  } = useHorizontalDragScroll<HTMLDivElement>();

  const toggleCheck = (index: number) => {
    setChecked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const totalWidth = COLUMNS.reduce((sum, col) => sum + col.width, 0);

  const renderCell = (company: (typeof COMPANIES)[0], colId: string) => {
    switch (colId) {
      case 'company':
        return (
          <ChipEl $highlighted>
            <Favicon domain={company.domain} name={company.name} />
            <ChipLabel $bold>{company.name}</ChipLabel>
          </ChipEl>
        );
      case 'url':
        return (
          <LinkChip>
            <LinkLabel>{company.domain}</LinkLabel>
          </LinkChip>
        );
      case 'createdBy':
        return (
          <ChipEl>
            <Avatar
              name={company.createdBy.name}
              tone={company.createdBy.tone}
            />
            <ChipLabel>{company.createdBy.name}</ChipLabel>
          </ChipEl>
        );
      case 'address':
        return <ChipLabel>{company.address}</ChipLabel>;
      case 'accountOwner':
        return (
          <ChipEl>
            <Avatar
              name={company.accountOwner.name}
              tone={company.accountOwner.tone}
            />
            <ChipLabel>{company.accountOwner.name}</ChipLabel>
          </ChipEl>
        );
      case 'icp':
        return (
          <BooleanRow>
            <svg
              fill="none"
              height="11"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              style={{ color: CARD_TEXT_SECONDARY }}
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
      default:
        return null;
    }
  };

  return (
    <Root>
      <ViewHeader>
        <ViewTitle>All Companies</ViewTitle>
        <ViewCount>· 9</ViewCount>
      </ViewHeader>

      <TableShell>
        <GripRail>
          {Array.from({ length: 11 }).map((_, i) => (
            <GripCell key={i} />
          ))}
        </GripRail>

        <TableViewport
          ref={viewportRef}
          $dragging={dragging}
          onPointerCancel={onPointerCancel}
          onPointerDown={onPointerDown}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <TableCanvas $width={totalWidth}>
            <HeaderRow>
              {COLUMNS.map((col) => (
                <Cell key={col.id} $header $width={col.width}>
                  <HeaderContent>
                    {col.isFirst && (
                      <CheckboxWrap>
                        <CheckboxBox />
                      </CheckboxWrap>
                    )}
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
                        <path d={HEADER_ICON_PATHS[col.id]} />
                      </svg>
                    </HeaderIcon>
                    <HeaderLabel>{col.label}</HeaderLabel>
                    {col.isFirst && (
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
                    )}
                  </HeaderContent>
                </Cell>
              ))}
            </HeaderRow>

            {COMPANIES.map((company, index) => {
              const hovered = hoveredRow === index;
              return (
                <DataRow
                  key={company.domain}
                  $index={index}
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() =>
                    setHoveredRow((c) => (c === index ? null : c))
                  }
                >
                  {COLUMNS.map((col) => (
                    <Cell key={col.id} $hovered={hovered} $width={col.width}>
                      {col.isFirst ? (
                        <HeaderContent>
                          <CheckboxWrap
                            onClick={() => toggleCheck(index)}
                            onPointerDown={(e) => e.stopPropagation()}
                          >
                            <CheckboxBox $checked={!!checked[index]}>
                              {checked[index] && (
                                <svg
                                  fill="none"
                                  height="9"
                                  viewBox="0 0 12 12"
                                  width="9"
                                >
                                  <path
                                    d="M3 6.5L5 8.5L9 4"
                                    stroke={CARD_ACCENT}
                                    strokeLinecap="round"
                                    strokeWidth="1.5"
                                  />
                                </svg>
                              )}
                            </CheckboxBox>
                          </CheckboxWrap>
                          {renderCell(company, col.id)}
                        </HeaderContent>
                      ) : (
                        renderCell(company, col.id)
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
