'use client';

import { styled } from '@linaria/react';
import { useCallback, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import { FIELDS, NAV } from './data/layout.data';
import {
  CheckSvg,
  ChevLeft,
  DotsV,
  DotsVW,
  EyeIcon,
  FieldIcon,
  GripV,
  ListSvg,
  NavSvgIcon,
  NewSecSvg,
  PaintSvg,
  PlusSvg,
  SparkSvg,
} from './icons/layout-icons';
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

const Canvas = styled.div`
  font-family: ${STEPPER_FONT};
  height: 100%;
  position: relative;
  width: 100%;
`;

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
  border: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-radius: 50px;
  color: ${STEPPER_TEXT};
  font-size: 8px;
  padding: 1px 6px;
`;

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
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  font-weight: 600;
  padding: 4px 3px;
`;

const NavItem = styled.div<{ $active: boolean }>`
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

const NavIconBox = styled.span<{ $bg: string }>`
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
  border-bottom: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-left: 0.5px solid ${STEPPER_BORDER_STRONG};
  border-radius: 0 0 0 2px;
  flex-shrink: 0;
  height: 8px;
  margin-left: -6px;
  width: 4px;
`;

const NavSuffix = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 6px;
`;

const NavChevron = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 6px;
  margin-left: auto;
`;

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
  border: 0.8px solid ${STEPPER_BORDER_SUBTLE};
  border-radius: ${R};
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 8px;
  font-weight: 500;
  padding: 3px 6px;
`;

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
  border-bottom: 0.8px solid ${STEPPER_BORDER_MEDIUM};
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
  background: ${STEPPER_TINT};
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
  border-bottom: 0.8px solid ${STEPPER_BORDER_LIGHT};
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
  background: ${STEPPER_TINT};
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
  color: ${STEPPER_TEXT_TERTIARY};
`;

const RPFieldType = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
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
  background: ${STEPPER_TINT};
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
  border-top: 0.8px solid ${STEPPER_BORDER_MEDIUM};
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
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 7px;
`;

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

      <ActionsBar>
        <ActionBtn>+ New record</ActionBtn>
        <ActionBtn>✧ Enrich</ActionBtn>
        <ActionBtn>✎ Edit actions</ActionBtn>
      </ActionsBar>

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
