import { styled } from '@linaria/react';

import {
  STEPPER_BORDER_LIGHT,
  STEPPER_BORDER_MEDIUM,
  STEPPER_BORDER_STRONG,
  STEPPER_BORDER_SUBTLE,
  STEPPER_FONT,
  STEPPER_TEXT,
  STEPPER_TEXT_SECONDARY,
  STEPPER_TEXT_TERTIARY,
  STEPPER_TINT,
} from './stepper-visual-tokens';

const ACCENT = '#3e63dd';
const GLASS = 'rgba(255,255,255,0.9)';
const R = '3px';

export const Canvas = styled.div`
  font-family: ${STEPPER_FONT};
  height: 100%;
  position: relative;
  width: 100%;
`;

export const MainCard = styled.div`
  background: white;
  border-radius: 4px;
  height: 84%;
  left: 16%;
  overflow: hidden;
  position: absolute;
  top: 8%;
  width: 72%;
`;

export const BlueHeader = styled.div`
  align-items: center;
  background: ${ACCENT};
  display: flex;
  height: 32px;
  justify-content: space-between;
  padding: 0 10px;
  width: 100%;
`;

export const HeaderLeft = styled.span`
  color: white;
  display: flex;
`;

export const HeaderCenter = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

export const HeaderTitle = styled.span`
  color: white;
  font-size: 10px;
  font-weight: 500;
`;

export const HeaderSave = styled.span`
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

export const WidgetPanel = styled.div`
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

export const WidgetInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const WidgetTitle = styled.div`
  color: ${STEPPER_TEXT};
  font-size: 10px;
  font-weight: 600;
  padding: 2px 3px;
`;

export const WSectionLabel = styled.div`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 7px;
  font-weight: 600;
  padding: 0 3px;
`;

export const WRow = styled.div`
  align-items: center;
  display: flex;
  gap: 3px;
  min-height: 16px;
  padding: 1px 3px;
`;

export const WIcon = styled.span`
  align-items: center;
  color: ${STEPPER_TEXT_TERTIARY};
  display: flex;
  flex-shrink: 0;
  height: 10px;
  justify-content: center;
  width: 10px;
`;

export const WLabel = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  flex-shrink: 0;
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 58px;
`;

export const WValue = styled.span`
  color: ${STEPPER_TEXT};
  flex: 1;
  font-size: 8px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const WChip = styled.span`
  background: rgba(0, 0, 0, 0.02);
  border: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-radius: 50px;
  color: ${STEPPER_TEXT};
  font-size: 8px;
  padding: 1px 6px;
`;

export const NavPanel = styled.div`
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

export const NavSectionLabel = styled.div`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  font-weight: 600;
  padding: 4px 3px;
`;

export const NavItem = styled.div<{ $active: boolean }>`
  align-items: center;
  background: ${({ $active }) => ($active ? STEPPER_TINT : 'transparent')};
  border-radius: ${R};
  color: ${({ $active }) => ($active ? STEPPER_TEXT : STEPPER_TEXT_SECONDARY)};
  cursor: pointer;
  display: flex;
  font-size: 9px;
  font-weight: 500;
  gap: 5px;
  padding: 5px 4px;
`;

export const NavIconBox = styled.span<{ $bg: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-radius: 3px;
  display: flex;
  flex-shrink: 0;
  height: 13px;
  justify-content: center;
  width: 13px;
`;

export const NavSubItem = styled.div`
  align-items: center;
  color: ${STEPPER_TEXT_SECONDARY};
  display: flex;
  font-size: 8px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 4px 4px 16px;
`;

export const NavBreadcrumb = styled.span`
  border-bottom: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-left: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-radius: 0 0 0 2px;
  flex-shrink: 0;
  height: 8px;
  margin-left: -6px;
  width: 4px;
`;

export const NavSuffix = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 6px;
`;

export const NavChevron = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 6px;
  margin-left: auto;
`;

export const ActionsBar = styled.div`
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

export const ActionBtn = styled.span`
  border: 0.8px solid ${STEPPER_BORDER_SUBTLE};
  border-radius: ${R};
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
  font-weight: 500;
  padding: 3px 6px;
`;

export const RightPanel = styled.div`
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

export const RPHeader = styled.div`
  align-items: center;
  border-bottom: 0.8px solid ${STEPPER_BORDER_MEDIUM};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 6px;
`;

export const RPBackBtn = styled.span`
  align-items: center;
  color: ${STEPPER_TEXT_TERTIARY};
  cursor: pointer;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const RPIconBox = styled.span`
  align-items: center;
  background: ${STEPPER_TINT};
  border-radius: 3px;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const RPTitleGroup = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  gap: 3px;
  min-width: 0;
`;

export const RPTitleBold = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 9px;
  font-weight: 600;
`;

export const RPTitleSub = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const RPSubBar = styled.div`
  align-items: center;
  border-bottom: 0.8px solid ${STEPPER_BORDER_LIGHT};
  display: flex;
  flex-shrink: 0;
  gap: 3px;
  padding: 5px 6px;
`;

export const RPSubLabel = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  font-weight: 500;
`;

export const RPFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
  padding: 6px;
`;

export const RPSectionRow = styled.div`
  align-items: center;
  display: flex;
  gap: 5px;
  padding: 3px;
`;

export const RPSectionName = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  flex: 1;
  font-size: 7px;
  font-weight: 600;
`;

export const RPEditable = styled.div`
  align-items: center;
  background: white;
  border: 1px solid ${ACCENT};
  border-radius: ${R};
  display: flex;
  gap: 4px;
  margin: 2px 0 4px;
  padding: 4px 6px;
`;

export const RPEditText = styled.span`
  color: ${STEPPER_TEXT};
  flex: 1;
  font-size: 9px;
`;

export const RPDoneBtn = styled.span`
  background: ${ACCENT};
  border-radius: 3px;
  color: white;
  cursor: pointer;
  font-size: 7px;
  font-weight: 600;
  padding: 2px 8px;
`;

export const RPFieldRow = styled.div<{ $dragging: boolean }>`
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

export const RPFieldIconBox = styled.span`
  align-items: center;
  background: ${STEPPER_TINT};
  border-radius: 3px;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const RPFieldLabels = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  font-size: 8px;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

export const RPFieldName = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  flex-shrink: 0;
`;

export const RPFieldDot = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
`;

export const RPFieldType = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const RPActionBtn = styled.span`
  cursor: pointer;
  display: flex;
`;

export const RPAddSection = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 5px;
  padding: 3px;
`;

export const RPAddIconBox = styled.span`
  align-items: center;
  background: ${STEPPER_TINT};
  border-radius: 3px;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const RPAddText = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
`;

export const RPNewFields = styled.div`
  align-items: center;
  border-top: 0.8px solid ${STEPPER_BORDER_MEDIUM};
  display: flex;
  gap: 5px;
  margin-top: 4px;
  padding: 6px 3px 3px;
`;

export const RPNewTitle = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
`;

export const RPNewDesc = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 7px;
`;
