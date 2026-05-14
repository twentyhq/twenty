'use client';

import { styled } from '@linaria/react';
import { useCallback, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import {
  STEPPER_ACCENT_GREEN,
  STEPPER_FONT,
  STEPPER_TEXT,
  STEPPER_TEXT_SECONDARY,
  STEPPER_TEXT_TERTIARY,
} from './stepper-visual-tokens';

const ACCENT = '#3e63dd';
const LIGHT = '#b3b3b3';
const STRONGER = '#d6d6d6';
const MEDIUM_BORDER = '#ebebeb';
const LIGHT_BORDER = '#f1f1f1';
const GLASS = 'rgba(255,255,255,0.9)';
const TINT = 'rgba(0,0,0,0.04)';
const R = '3px';

type FieldDef = {
  icon: 'link' | 'user' | 'money' | 'target' | 'users' | 'map' | 'calendar';
  id: string;
  label: string;
  section: string;
  type: string;
  visible: boolean;
};

const FIELDS: FieldDef[] = [
  {
    id: 'url',
    icon: 'link',
    label: 'URL',
    type: 'Link',
    section: 'General',
    visible: true,
  },
  {
    id: 'account-owner',
    icon: 'user',
    label: 'Account Owner',
    type: 'Relation',
    section: 'General',
    visible: true,
  },
  {
    id: 'revenue',
    icon: 'money',
    label: 'Revenue',
    type: 'Currency',
    section: 'General',
    visible: true,
  },
  {
    id: 'icp',
    icon: 'target',
    label: 'ICP',
    type: 'Boolean',
    section: 'Additional',
    visible: false,
  },
  {
    id: 'employees',
    icon: 'users',
    label: 'Employees',
    type: 'Number',
    section: 'Other',
    visible: true,
  },
  {
    id: 'address',
    icon: 'map',
    label: 'Address',
    type: 'Address',
    section: 'Other',
    visible: true,
  },
  {
    id: 'creation-date',
    icon: 'calendar',
    label: 'Creation date',
    type: 'Date & Time',
    section: 'Other',
    visible: true,
  },
];

// ── Canvas ──────────────────────────────────────────────────────────────────

const Canvas = styled.div`
  font-family: ${STEPPER_FONT};
  height: 100%;
  position: relative;
  width: 100%;
`;

// ── Layer 1: Main white card with blue header ───────────────────────────────

const MainCard = styled.div`
  background: white;
  border-radius: 4px;
  height: 84%;
  left: 16%;
  overflow: hidden;
  position: absolute;
  top: 8%;
  width: 72%;
`;

const BlueHeader = styled.div`
  align-items: center;
  background: ${ACCENT};
  display: flex;
  height: 32px;
  justify-content: space-between;
  padding: 0 10px;
  width: 100%;
`;

const HeaderLeft = styled.span`
  color: white;
  display: flex;
`;

const HeaderCenter = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const HeaderTitle = styled.span`
  color: white;
  font-size: 10px;
  font-weight: 500;
`;

const HeaderSave = styled.span`
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: ${R};
  color: white;
  display: flex;
  font-size: 8px;
  font-weight: 500;
  gap: 3px;
  padding: 2px 8px;
`;

const MainCardBody = styled.div`
  padding: 10px;
`;

// ── Layer 2: Widget card (inside main card area) ────────────────────────────

const WidgetPanel = styled.div`
  backdrop-filter: blur(5px);
  background: ${GLASS};
  border: 0.8px solid ${ACCENT};
  border-radius: ${R};
  left: 50%;
  max-height: 36%;
  overflow: hidden;
  padding: 6px;
  position: absolute;
  top: 20%;
  width: 38%;
`;

const WidgetInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const WidgetTitle = styled.div`
  color: ${STEPPER_TEXT};
  font-size: 10px;
  font-weight: 600;
  padding: 2px 3px;
`;

const WSectionLabel = styled.div`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 7px;
  font-weight: 600;
  padding: 0 3px;
`;

const WRow = styled.div`
  align-items: center;
  display: flex;
  gap: 3px;
  min-height: 16px;
  padding: 1px 3px;
`;

const WIcon = styled.span`
  align-items: center;
  color: ${STEPPER_TEXT_TERTIARY};
  display: flex;
  flex-shrink: 0;
  height: 10px;
  justify-content: center;
  width: 10px;
`;

const WLabel = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  flex-shrink: 0;
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 58px;
`;

const WValue = styled.span`
  color: ${STEPPER_TEXT};
  flex: 1;
  font-size: 8px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const WChip = styled.span`
  background: rgba(0, 0, 0, 0.02);
  border: 0.5px solid ${STRONGER};
  border-radius: 50px;
  color: ${STEPPER_TEXT};
  font-size: 8px;
  padding: 1px 6px;
`;

// ── Layer 3: Navigation sidebar ─────────────────────────────────────────────

const NavPanel = styled.div`
  backdrop-filter: blur(5px);
  background: ${GLASS};
  border: 0.8px solid ${ACCENT};
  border-radius: ${R};
  left: 10%;
  max-height: 68%;
  overflow-y: auto;
  padding: 8px;
  position: absolute;
  top: 17%;
  width: 30%;
`;

const NavSectionLabel = styled.div`
  color: ${LIGHT};
  font-size: 8px;
  font-weight: 600;
  padding: 4px 3px;
`;

const NavItem = styled.div<{ $active: boolean }>`
  align-items: center;
  background: ${({ $active }) => ($active ? TINT : 'transparent')};
  border-radius: ${R};
  color: ${({ $active }) => ($active ? STEPPER_TEXT : STEPPER_TEXT_SECONDARY)};
  cursor: pointer;
  display: flex;
  font-size: 9px;
  font-weight: 500;
  gap: 5px;
  padding: 5px 4px;
`;

const NavIconBox = styled.span<{ $bg: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border: 0.5px solid ${STRONGER};
  border-radius: 3px;
  display: flex;
  flex-shrink: 0;
  height: 13px;
  justify-content: center;
  width: 13px;
`;

const NavSubItem = styled.div`
  align-items: center;
  color: ${STEPPER_TEXT_SECONDARY};
  display: flex;
  font-size: 8px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 4px 4px 16px;
`;

const NavBreadcrumb = styled.span`
  border-bottom: 0.5px solid ${STRONGER};
  border-left: 0.5px solid ${STRONGER};
  border-radius: 0 0 0 2px;
  flex-shrink: 0;
  height: 8px;
  margin-left: -6px;
  width: 4px;
`;

const NavSuffix = styled.span`
  color: ${LIGHT};
  font-size: 6px;
`;

const NavChevron = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 6px;
  margin-left: auto;
`;

// ── Layer 4: Actions bar ────────────────────────────────────────────────────

const ActionsBar = styled.div`
  backdrop-filter: blur(5px);
  background: ${GLASS};
  border: 0.8px solid ${ACCENT};
  border-radius: ${R};
  display: flex;
  gap: 5px;
  left: 54%;
  padding: 5px 6px;
  position: absolute;
  top: 14%;
  z-index: 3;
`;

const ActionBtn = styled.span`
  border: 0.8px solid rgba(0, 0, 0, 0.08);
  border-radius: ${R};
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
  font-weight: 500;
  padding: 3px 6px;
`;

// ── Layer 5: Right panel (Layout editor) ────────────────────────────────────

const RightPanel = styled.div`
  backdrop-filter: blur(5px);
  background: ${GLASS};
  border: 0.8px solid #4a38f5;
  border-radius: ${R};
  bottom: 3%;
  display: flex;
  flex-direction: column;
  left: 42%;
  overflow: hidden;
  position: absolute;
  top: 40%;
  width: 54%;
  z-index: 4;
`;

const RPHeader = styled.div`
  align-items: center;
  border-bottom: 0.8px solid ${MEDIUM_BORDER};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 6px;
`;

const RPBackBtn = styled.span`
  align-items: center;
  color: ${STEPPER_TEXT_TERTIARY};
  cursor: pointer;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const RPIconBox = styled.span`
  align-items: center;
  background: ${TINT};
  border-radius: 3px;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const RPTitleGroup = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  gap: 3px;
  min-width: 0;
`;

const RPTitleBold = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 9px;
  font-weight: 600;
`;

const RPTitleSub = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RPSubBar = styled.div`
  align-items: center;
  border-bottom: 0.8px solid ${LIGHT_BORDER};
  display: flex;
  flex-shrink: 0;
  gap: 3px;
  padding: 5px 6px;
`;

const RPSubLabel = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  font-weight: 500;
`;

const RPFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
  padding: 6px;
`;

const RPSectionRow = styled.div`
  align-items: center;
  display: flex;
  gap: 5px;
  padding: 3px;
`;

const RPSectionName = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  flex: 1;
  font-size: 7px;
  font-weight: 600;
`;

const RPEditable = styled.div`
  align-items: center;
  background: white;
  border: 1px solid ${ACCENT};
  border-radius: ${R};
  display: flex;
  gap: 4px;
  margin: 2px 0 4px;
  padding: 4px 6px;
`;

const RPEditText = styled.span`
  color: ${STEPPER_TEXT};
  flex: 1;
  font-size: 9px;
`;

const RPDoneBtn = styled.span`
  background: ${ACCENT};
  border-radius: 3px;
  color: white;
  cursor: pointer;
  font-size: 7px;
  font-weight: 600;
  padding: 2px 8px;
`;

const RPFieldRow = styled.div<{ $dragging: boolean }>`
  align-items: center;
  background: ${({ $dragging }) =>
    $dragging ? 'rgba(59,130,246,0.04)' : 'transparent'};
  border-radius: ${R};
  cursor: grab;
  display: flex;
  gap: 5px;
  padding: 3px;
  touch-action: none;

  &:active {
    cursor: grabbing;
  }
`;

const RPFieldIconBox = styled.span`
  align-items: center;
  background: ${TINT};
  border-radius: 3px;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const RPFieldLabels = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  font-size: 8px;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

const RPFieldName = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  flex-shrink: 0;
`;

const RPFieldDot = styled.span`
  color: ${LIGHT};
`;

const RPFieldType = styled.span`
  color: ${LIGHT};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RPActionBtn = styled.span`
  cursor: pointer;
  display: flex;
`;

const RPAddSection = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 5px;
  padding: 3px;
`;

const RPAddIconBox = styled.span`
  align-items: center;
  background: ${TINT};
  border-radius: 3px;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const RPAddText = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
`;

const RPNewFields = styled.div`
  align-items: center;
  border-top: 0.8px solid ${MEDIUM_BORDER};
  display: flex;
  gap: 5px;
  margin-top: 4px;
  padding: 6px 3px 3px;
`;

const RPNewTitle = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
`;

const RPNewDesc = styled.span`
  color: ${LIGHT};
  font-size: 7px;
`;

// ── SVG helpers ─────────────────────────────────────────────────────────────

function FieldIcon({ type }: { type: FieldDef['icon'] }) {
  const c = '#666';
  const z = 10;
  switch (type) {
    case 'link':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M7 9a3.5 3.5 0 005 0l2-2a3.536 3.536 0 00-5-5L8 3m1 4a3.5 3.5 0 00-5 0L2 9a3.536 3.536 0 005 5l1-1"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="5.5" r="2.5" stroke={c} strokeWidth={1.2} />
          <path
            d="M3.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'money':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M8 2v12M5 4.5h4.5a1.5 1.5 0 010 3H5.5a1.5 1.5 0 000 3H11"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'target':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="8" r="6" stroke={c} strokeWidth={1.2} />
          <circle cx="8" cy="8" r="3" stroke={c} strokeWidth={1.2} />
          <circle cx="8" cy="8" fill={c} r="1" />
        </svg>
      );
    case 'users':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="6" cy="5" r="2" stroke={c} strokeWidth={1.2} />
          <path
            d="M2 13c0-2 1.5-3.5 4-3.5s4 1.5 4 3.5"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
          <circle cx="11" cy="5.5" r="1.5" stroke={c} strokeWidth={1.2} />
          <path
            d="M12 9.5c1.5.5 2.5 1.5 2.5 3"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'map':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M3 4l3.5-1.5 3 1.5L13 2.5v9.5l-3.5 1.5-3-1.5L3 13.5V4z"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
          <path d="M6.5 2.5v9M9.5 4v9" stroke={c} strokeWidth={1.2} />
        </svg>
      );
    case 'calendar':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="10"
            rx="1.5"
            stroke={c}
            strokeWidth={1.2}
            width="10"
            x="3"
            y="3.5"
          />
          <path d="M3 7h10M6 2v2M10 2v2" stroke={c} strokeWidth={1.2} />
        </svg>
      );
    default:
      return null;
  }
}

function NavSvgIcon({ type }: { type: string }) {
  const c = '#555';
  const z = 7;
  switch (type) {
    case 'building':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M5 14V3l6 2v9M5 6H3v8h12V7h-4"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'user':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="5" r="2.5" stroke={c} strokeWidth={1.4} />
          <path
            d="M3.5 14c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'target':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="8" r="5" stroke={c} strokeWidth={1.4} />
          <circle cx="8" cy="8" r="2" stroke={c} strokeWidth={1.4} />
          <path d="M8 3v2M13 8h-2" stroke={c} strokeWidth={1.4} />
        </svg>
      );
    case 'checkbox':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="10"
            rx="2"
            stroke={c}
            strokeWidth={1.4}
            width="10"
            x="3"
            y="3"
          />
          <path
            d="M6 8l1.5 1.5L10 6"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'notes':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="10"
            rx="1.5"
            stroke={c}
            strokeWidth={1.4}
            width="8"
            x="4"
            y="3"
          />
          <path
            d="M6.5 6h3M6.5 8.5h3"
            stroke={c}
            strokeLinecap="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'automation':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <circle cx="8" cy="8" r="5" stroke={c} strokeWidth={1.4} />
          <path
            d="M8 5v3l2 1"
            stroke={c}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'play':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M5 3.5l8 4.5-8 4.5V3.5z"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.4}
          />
        </svg>
      );
    case 'versions':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <rect
            height="8"
            rx="1"
            stroke={c}
            strokeWidth={1.4}
            width="6"
            x="5"
            y="4"
          />
          <path d="M3 6v6a1 1 0 001 1h6" stroke={c} strokeWidth={1.4} />
        </svg>
      );
    case 'ai':
      return (
        <svg fill="none" height={z} viewBox="0 0 16 16" width={z}>
          <path
            d="M8 2l1.5 4L14 8l-4.5 2L8 14l-1.5-4L2 8l4.5-2L8 2z"
            stroke={c}
            strokeLinejoin="round"
            strokeWidth={1.2}
          />
        </svg>
      );
    case 'letter-S':
      return (
        <svg height={z} viewBox="0 0 16 16" width={z}>
          <text
            fill="#35290f"
            fontFamily="Inter"
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
            x="8"
            y="12"
          >
            S
          </text>
        </svg>
      );
    case 'stripe-S':
      return (
        <svg height={z} viewBox="0 0 16 16" width={z}>
          <text
            fill="#333"
            fontFamily="Inter"
            fontSize="9"
            fontWeight="600"
            textAnchor="middle"
            x="8"
            y="12"
          >
            S
          </text>
        </svg>
      );
    default:
      return null;
  }
}

function EyeIcon({ visible }: { visible: boolean }) {
  if (visible)
    return (
      <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
        <path
          d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
          stroke="#999"
          strokeLinejoin="round"
          strokeWidth={1.2}
        />
        <circle cx="8" cy="8" r="1.5" stroke="#999" strokeWidth={1.2} />
      </svg>
    );
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z"
        stroke="#b3b3b3"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
      <path
        d="M3 3l10 10"
        stroke="#b3b3b3"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}

function ChevLeft() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M10 4l-4 4 4 4"
        stroke="#999"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
function ChevDown() {
  return (
    <svg fill="none" height={7} viewBox="0 0 16 16" width={7}>
      <path
        d="M4 6l4 4 4-4"
        stroke="#999"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.3}
      />
    </svg>
  );
}
function DotsV() {
  return (
    <svg fill="none" height={10} viewBox="0 0 4 12" width={5}>
      <circle cx="2" cy="2" fill="#999" r="0.8" />
      <circle cx="2" cy="6" fill="#999" r="0.8" />
      <circle cx="2" cy="10" fill="#999" r="0.8" />
    </svg>
  );
}
function DotsVW() {
  return (
    <svg fill="none" height={12} viewBox="0 0 4 12" width={5}>
      <circle cx="2" cy="2" fill="white" r="1" />
      <circle cx="2" cy="6" fill="white" r="1" />
      <circle cx="2" cy="10" fill="white" r="1" />
    </svg>
  );
}
function GripV() {
  return (
    <svg fill="none" height={10} viewBox="0 0 8 12" width={7}>
      <circle cx="3" cy="2" fill="#999" r="0.8" />
      <circle cx="5" cy="2" fill="#999" r="0.8" />
      <circle cx="3" cy="6" fill="#999" r="0.8" />
      <circle cx="5" cy="6" fill="#999" r="0.8" />
      <circle cx="3" cy="10" fill="#999" r="0.8" />
      <circle cx="5" cy="10" fill="#999" r="0.8" />
    </svg>
  );
}
function PaintSvg() {
  return (
    <svg fill="none" height={12} viewBox="0 0 16 16" width={12}>
      <rect
        height="6"
        rx="1"
        stroke="white"
        strokeWidth={1.2}
        width="8"
        x="4"
        y="3"
      />
      <path
        d="M6 9v3a1 1 0 001 1h0a1 1 0 001-1V9"
        stroke="white"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
function CheckSvg() {
  return (
    <svg fill="none" height={8} viewBox="0 0 16 16" width={8}>
      <path
        d="M3 8l4 4 6-8"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
}
function ListSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M3 4h4M3 8h4M3 12h4M9 4h4M9 8h4M9 12h4"
        stroke="#666"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
function SparkSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M8 2l1.5 4.5L14 8l-4.5 1.5L8 14l-1.5-4.5L2 8l4.5-1.5L8 2z"
        stroke="#999"
        strokeLinejoin="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
function NewSecSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M3 4h10M3 8h5M3 12h10M12 8v4M10 10h4"
        stroke="#666"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
function PlusSvg() {
  return (
    <svg fill="none" height={10} viewBox="0 0 16 16" width={10}>
      <path
        d="M8 3v10M3 8h10"
        stroke="#666"
        strokeLinecap="round"
        strokeWidth={1.2}
      />
    </svg>
  );
}
// ── Nav data ────────────────────────────────────────────────────────────────

const NAV = [
  { icon: 'building', label: 'Companies', active: true, bg: '#d9e2fc' },
  { icon: 'user', label: 'People', active: false, bg: '#d9e2fc' },
  { icon: 'target', label: 'Opportunities', active: false, bg: '#fdd8d8' },
  { icon: 'checkbox', label: 'Tasks', active: false, bg: '#c7ebe5' },
  { icon: 'notes', label: 'Notes', active: false, bg: '#c7ebe5' },
  {
    icon: 'letter-S',
    label: 'Sales Dashboard',
    active: false,
    bg: '#fef2a4',
    suffix: 'Dashboard',
  },
  {
    icon: 'automation',
    label: 'Workflows',
    active: false,
    bg: '#ffdcc3',
    folder: true,
    children: [
      { icon: 'automation', label: 'Workflows', bg: '#ebebeb' },
      { icon: 'play', label: 'Workflows runs', bg: '#ebebeb' },
      { icon: 'versions', label: 'Workflows versions', bg: '#ebebeb' },
    ],
  },
  { icon: 'ai', label: 'Claude', active: false, bg: '#ebebeb' },
  {
    icon: 'stripe-S',
    label: 'Stripe',
    active: false,
    bg: '#ebebeb',
    folder: true,
  },
] as const;

// ── Component ───────────────────────────────────────────────────────────────

export function LayoutVisual({ active }: StepperVisualProps) {
  const [fields, setFields] = useState(FIELDS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartY = useRef(0);

  const toggleVisibility = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, visible: !f.visible } : f)),
    );
  };

  const handleDragStart = useCallback(
    (fieldId: string, event: React.PointerEvent) => {
      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      setDraggingId(fieldId);
      dragStartY.current = event.clientY;
    },
    [],
  );

  const handleDragMove = useCallback(
    (event: React.PointerEvent) => {
      if (!draggingId) return;
      const dy = event.clientY - dragStartY.current;
      const steps = Math.round(dy / 22);
      if (steps === 0) return;
      const idx = fields.findIndex((f) => f.id === draggingId);
      const to = Math.max(0, Math.min(fields.length - 1, idx + steps));
      if (to === idx) return;
      setFields((prev) => {
        const next = [...prev];
        const [moved] = next.splice(idx, 1);
        next.splice(to, 0, moved);
        return next;
      });
      dragStartY.current = event.clientY;
    },
    [draggingId, fields],
  );

  const handleDragEnd = useCallback(() => setDraggingId(null), []);
  const sections = [...new Set(fields.map((f) => f.section))];

  return (
    <Canvas style={{ opacity: active ? 1 : 0.6, transition: 'opacity 0.3s' }}>
      {/* Layer 1: Main white card with blue header */}
      <MainCard>
        <BlueHeader>
          <HeaderLeft>
            <DotsVW />
          </HeaderLeft>
          <HeaderCenter>
            <PaintSvg />
            <HeaderTitle>Layout edition</HeaderTitle>
          </HeaderCenter>
          <HeaderSave>
            <CheckSvg /> Save
          </HeaderSave>
        </BlueHeader>
      </MainCard>

      {/* Layer 2: Widget card (overlaps main card) */}
      <WidgetPanel>
        <WidgetInner>
          <WidgetTitle>Widget name</WidgetTitle>
          <WSectionLabel>General</WSectionLabel>
          <WRow>
            <WIcon>
              <FieldIcon type="link" />
            </WIcon>
            <WLabel>URL</WLabel>
            <WChip>qonto.com</WChip>
          </WRow>
          <WRow>
            <WIcon>
              <FieldIcon type="user" />
            </WIcon>
            <WLabel>Account O...</WLabel>
            <WValue>Phil Schiller</WValue>
          </WRow>
          <WRow>
            <WIcon>
              <FieldIcon type="map" />
            </WIcon>
            <WLabel>Address</WLabel>
            <WValue>18 Rue De Navarin, 750...</WValue>
          </WRow>
          <WRow>
            <WIcon>
              <FieldIcon type="target" />
            </WIcon>
            <WLabel>ICP</WLabel>
            <WValue>✓ True</WValue>
          </WRow>
        </WidgetInner>
      </WidgetPanel>

      {/* Layer 3: Navigation sidebar (overlaps main card from left) */}
      <NavPanel>
        <NavSectionLabel>Workspace</NavSectionLabel>
        {NAV.map((item) => (
          <div key={item.label}>
            <NavItem $active={item.active}>
              <NavIconBox $bg={item.bg}>
                <NavSvgIcon type={item.icon} />
              </NavIconBox>
              {item.label}
              {'suffix' in item && item.suffix && (
                <NavSuffix>· {item.suffix}</NavSuffix>
              )}
              {'folder' in item && item.folder && <NavChevron>▾</NavChevron>}
            </NavItem>
            {'children' in item &&
              item.children?.map((child) => (
                <NavSubItem key={child.label}>
                  <NavBreadcrumb />
                  <NavIconBox $bg={child.bg}>
                    <NavSvgIcon type={child.icon} />
                  </NavIconBox>
                  {child.label}
                </NavSubItem>
              ))}
          </div>
        ))}
      </NavPanel>

      {/* Layer 4: Actions bar (floats above widget) */}
      <ActionsBar>
        <ActionBtn>+ New record</ActionBtn>
        <ActionBtn>✧ Enrich</ActionBtn>
        <ActionBtn>✎ Edit actions</ActionBtn>
      </ActionsBar>

      {/* Layer 5: Right panel / Layout editor (overlaps everything) */}
      <RightPanel onPointerMove={handleDragMove} onPointerUp={handleDragEnd}>
        <RPHeader>
          <RPBackBtn>
            <ChevLeft />
          </RPBackBtn>
          <RPIconBox>
            <ListSvg />
          </RPIconBox>
          <RPTitleGroup>
            <RPTitleBold>Fields</RPTitleBold>
            <RPTitleSub>Fields widget</RPTitleSub>
          </RPTitleGroup>
          <RPActionBtn>
            <SparkSvg />
          </RPActionBtn>
        </RPHeader>

        <RPSubBar>
          <RPBackBtn>
            <ChevLeft />
          </RPBackBtn>
          <RPSubLabel>Layout</RPSubLabel>
        </RPSubBar>

        <RPFields>
          {sections.map((section, si) => (
            <div key={section}>
              <RPSectionRow>
                <GripV />
                <RPSectionName>{section}</RPSectionName>
                <RPActionBtn>
                  <DotsV />
                </RPActionBtn>
              </RPSectionRow>

              {si === 0 && (
                <RPEditable>
                  <RPEditText>Industry</RPEditText>
                  <RPDoneBtn>Done</RPDoneBtn>
                </RPEditable>
              )}

              {fields
                .filter((f) => f.section === section)
                .map((field) => (
                  <RPFieldRow
                    key={field.id}
                    $dragging={draggingId === field.id}
                    onPointerDown={(e) => handleDragStart(field.id, e)}
                  >
                    <RPFieldIconBox>
                      <FieldIcon type={field.icon} />
                    </RPFieldIconBox>
                    <RPFieldLabels>
                      <RPFieldName>{field.label}</RPFieldName>
                      <RPFieldDot>·</RPFieldDot>
                      <RPFieldType>{field.type}</RPFieldType>
                    </RPFieldLabels>
                    <RPActionBtn
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(field.id);
                      }}
                    >
                      <EyeIcon visible={field.visible} />
                    </RPActionBtn>
                    <RPActionBtn>
                      <DotsV />
                    </RPActionBtn>
                  </RPFieldRow>
                ))}

              {si > 0 && si < sections.length - 1 && (
                <RPAddSection>
                  <RPAddIconBox>
                    <NewSecSvg />
                  </RPAddIconBox>
                  <RPAddText>Add a Section</RPAddText>
                </RPAddSection>
              )}
            </div>
          ))}

          <RPNewFields>
            <RPAddIconBox>
              <PlusSvg />
            </RPAddIconBox>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <RPNewTitle>New fields</RPNewTitle>
              <RPNewDesc>Default position/visibility for field…</RPNewDesc>
            </div>
          </RPNewFields>

          <RPAddSection>
            <RPAddIconBox>
              <NewSecSvg />
            </RPAddIconBox>
            <RPAddText>Add a Section</RPAddText>
          </RPAddSection>
        </RPFields>
      </RightPanel>
    </Canvas>
  );
}
