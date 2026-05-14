'use client';

import { styled } from '@linaria/react';
import { useCallback, useRef, useState } from 'react';

import type { StepperVisualProps } from '../types';

import {
  STEPPER_BG,
  STEPPER_BORDER,
  STEPPER_FONT,
  STEPPER_RADIUS_SM,
  STEPPER_SHADOW,
  STEPPER_SURFACE,
  STEPPER_TEXT,
  STEPPER_TEXT_SECONDARY,
  STEPPER_TEXT_TERTIARY,
  STEPPER_ACCENT_BLUE,
  STEPPER_ACCENT_GREEN,
  STEPPER_ACCENT_PURPLE,
} from './stepper-visual-tokens';

type FieldDef = {
  icon: string;
  id: string;
  label: string;
  section: string;
  type: string;
  visible: boolean;
};

const INITIAL_FIELDS: FieldDef[] = [
  {
    id: 'url',
    icon: '🔗',
    label: 'URL',
    type: 'URL',
    section: 'General',
    visible: true,
  },
  {
    id: 'account-owner',
    icon: '👤',
    label: 'Account Owner',
    type: 'Relation',
    section: 'General',
    visible: true,
  },
  {
    id: 'revenue',
    icon: '💰',
    label: 'Revenue',
    type: 'Currency',
    section: 'General',
    visible: true,
  },
  {
    id: 'icp',
    icon: '◈',
    label: 'ICP',
    type: 'Boolean',
    section: 'Additional',
    visible: true,
  },
  {
    id: 'employees',
    icon: '👥',
    label: 'Employees',
    type: 'Number',
    section: 'Other',
    visible: true,
  },
  {
    id: 'address',
    icon: '📍',
    label: 'Address',
    type: 'Address',
    section: 'Other',
    visible: true,
  },
  {
    id: 'creation-date',
    icon: '📅',
    label: 'Creation date',
    type: 'Date & Time',
    section: 'Other',
    visible: true,
  },
];

const SIDEBAR_ITEMS = [
  { icon: '🏛', label: 'Companies', active: true },
  { icon: '👥', label: 'People', active: false },
  { icon: '🎯', label: 'Opportunities', active: false },
  { icon: '✓', label: 'Tasks', active: false },
  { icon: '📝', label: 'Notes', active: false },
  { icon: 'S', label: 'Sales Dashboard', active: false },
  { icon: '⟳', label: 'Workflows', active: false, folder: true },
  { icon: '🤖', label: 'Claude', active: false },
  { icon: 'S', label: 'Stripe', active: false, folder: true },
];

const Canvas = styled.div`
  display: grid;
  font-family: ${STEPPER_FONT};
  grid-template-columns: 120px 1fr 180px;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TopBar = styled.div`
  align-items: center;
  background: ${STEPPER_BG};
  border-bottom: 1px solid ${STEPPER_BORDER};
  display: flex;
  gap: 8px;
  grid-column: 1 / -1;
  justify-content: center;
  padding: 6px 12px;
`;

const TopBarIcon = styled.span`
  font-size: 10px;
`;

const TopBarTitle = styled.span`
  color: ${STEPPER_ACCENT_BLUE};
  font-size: 11px;
  font-weight: 600;
`;

const TopBarSave = styled.button`
  align-items: center;
  background: ${STEPPER_ACCENT_BLUE};
  border: none;
  border-radius: ${STEPPER_RADIUS_SM};
  color: white;
  display: flex;
  font-size: 9px;
  font-weight: 600;
  gap: 4px;
  margin-left: auto;
  padding: 4px 10px;
`;

const Sidebar = styled.div`
  background: ${STEPPER_SURFACE};
  border-right: 1px solid ${STEPPER_BORDER};
  overflow: hidden;
  padding: 8px 6px;
`;

const SidebarLabel = styled.div`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
  padding: 2px 6px;
  text-transform: uppercase;
`;

const SidebarItem = styled.div<{ $active: boolean }>`
  align-items: center;
  background: ${({ $active }) =>
    $active ? `${STEPPER_ACCENT_BLUE}10` : 'transparent'};
  border-radius: ${STEPPER_RADIUS_SM};
  color: ${({ $active }) =>
    $active ? STEPPER_ACCENT_BLUE : STEPPER_TEXT_SECONDARY};
  cursor: pointer;
  display: flex;
  font-size: 9px;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  gap: 5px;
  padding: 4px 6px;
  transition: background 0.15s ease;
`;

const SidebarIcon = styled.span`
  font-size: 10px;
  width: 14px;
`;

const MainContent = styled.div`
  background: ${STEPPER_BG};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 10px;
`;

const ContentHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
`;

const ContentActions = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const ContentBtn = styled.span`
  border: 1px solid ${STEPPER_BORDER};
  border-radius: ${STEPPER_RADIUS_SM};
  color: ${STEPPER_TEXT_SECONDARY};
  cursor: pointer;
  font-size: 8px;
  padding: 2px 6px;
`;

const WidgetCard = styled.div`
  background: ${STEPPER_BG};
  border: 1px solid ${STEPPER_BORDER};
  border-radius: 6px;
  box-shadow: ${STEPPER_SHADOW};
  flex: 1;
  overflow: hidden;
  padding: 10px;
`;

const WidgetTitle = styled.div`
  color: ${STEPPER_TEXT};
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 10px;
`;

const WidgetFieldRow = styled.div`
  align-items: center;
  border-bottom: 1px solid ${STEPPER_BORDER};
  display: grid;
  gap: 8px;
  grid-template-columns: 10px 80px 1fr;
  padding: 5px 4px;
`;

const FieldDot = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
`;

const FieldLabel = styled.span`
  color: ${STEPPER_TEXT_SECONDARY};
  font-size: 9px;
`;

const FieldValue = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 9px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RightPanel = styled.div`
  background: ${STEPPER_SURFACE};
  border-left: 1px solid ${STEPPER_BORDER};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px;
`;

const PanelHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid ${STEPPER_BORDER};
  display: flex;
  gap: 4px;
  margin-bottom: 6px;
  padding-bottom: 6px;
`;

const PanelBackBtn = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  cursor: pointer;
  font-size: 10px;
`;

const PanelIcon = styled.span`
  font-size: 10px;
`;

const PanelTitle = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 10px;
  font-weight: 500;
`;

const PanelPinBtn = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  cursor: pointer;
  font-size: 10px;
  margin-left: auto;
`;

const SectionHeader = styled.div<{ $expanded: boolean }>`
  align-items: center;
  color: ${STEPPER_TEXT_SECONDARY};
  cursor: pointer;
  display: flex;
  font-size: 9px;
  font-weight: 500;
  gap: 4px;
  margin-bottom: 4px;
  margin-top: 8px;
  user-select: none;
`;

const SectionChevron = styled.span<{ $expanded: boolean }>`
  display: inline-block;
  font-size: 8px;
  transform: ${({ $expanded }) =>
    $expanded ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.15s ease;
`;

const EditableSection = styled.div`
  background: ${STEPPER_BG};
  border: 1px solid ${STEPPER_ACCENT_BLUE};
  border-radius: ${STEPPER_RADIUS_SM};
  margin-bottom: 4px;
  padding: 3px 6px;
`;

const EditInput = styled.div`
  align-items: center;
  display: flex;
  gap: 4px;
`;

const EditInputText = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 9px;
`;

const DoneBtn = styled.span`
  background: ${STEPPER_ACCENT_GREEN};
  border-radius: 3px;
  color: white;
  font-size: 7px;
  font-weight: 600;
  margin-left: auto;
  padding: 2px 6px;
`;

const DraggableField = styled.div<{ $dragging: boolean; $visible: boolean }>`
  align-items: center;
  background: ${({ $dragging }) =>
    $dragging ? `${STEPPER_ACCENT_BLUE}08` : 'transparent'};
  border-radius: ${STEPPER_RADIUS_SM};
  cursor: grab;
  display: flex;
  gap: 4px;
  opacity: ${({ $visible }) => ($visible ? 1 : 0.5)};
  padding: 3px 4px;
  touch-action: none;
  transition:
    background 0.15s ease,
    opacity 0.15s ease;

  &:active {
    cursor: grabbing;
  }
`;

const DragHandle = styled.span`
  color: ${STEPPER_TEXT_TERTIARY};
  font-size: 8px;
`;

const DragFieldIcon = styled.span`
  font-size: 9px;
`;

const DragFieldLabel = styled.span`
  color: ${STEPPER_TEXT};
  font-size: 9px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const VisibilityBtn = styled.span<{ $visible: boolean }>`
  color: ${({ $visible }) =>
    $visible ? STEPPER_TEXT_TERTIARY : STEPPER_ACCENT_PURPLE};
  cursor: pointer;
  font-size: 9px;
  transition: color 0.15s ease;
`;

export function LayoutVisual({ active }: StepperVisualProps) {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['General', 'Additional', 'Other']),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartY = useRef(0);
  const dragFieldIndex = useRef(-1);

  const toggleVisibility = (fieldId: string) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, visible: !field.visible } : field,
      ),
    );
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const handleDragStart = useCallback(
    (fieldId: string, event: React.PointerEvent) => {
      event.preventDefault();
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      setDraggingId(fieldId);
      dragStartY.current = event.clientY;
      dragFieldIndex.current = fields.findIndex(
        (field) => field.id === fieldId,
      );
    },
    [fields],
  );

  const handleDragMove = useCallback(
    (event: React.PointerEvent) => {
      if (!draggingId) return;
      const dy = event.clientY - dragStartY.current;
      const steps = Math.round(dy / 24);
      if (steps === 0) return;

      const currentIndex = fields.findIndex((field) => field.id === draggingId);
      const newIndex = Math.max(
        0,
        Math.min(fields.length - 1, currentIndex + steps),
      );
      if (newIndex === currentIndex) return;

      setFields((prev) => {
        const next = [...prev];
        const [moved] = next.splice(currentIndex, 1);
        next.splice(newIndex, 0, moved);
        return next;
      });
      dragStartY.current = event.clientY;
    },
    [draggingId, fields],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
  }, []);

  const sections = [...new Set(fields.map((field) => field.section))];

  return (
    <Canvas style={{ opacity: active ? 1 : 0.6, transition: 'opacity 0.3s' }}>
      <TopBar>
        <TopBarIcon>⋮</TopBarIcon>
        <TopBarIcon>✏</TopBarIcon>
        <TopBarTitle>Layout edition</TopBarTitle>
        <TopBarSave>✓ Save</TopBarSave>
      </TopBar>

      <Sidebar>
        <SidebarLabel>Workspace</SidebarLabel>
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem key={item.label} $active={item.active}>
            <SidebarIcon>{item.icon}</SidebarIcon>
            {item.label}
            {item.folder && (
              <span style={{ marginLeft: 'auto', fontSize: 8 }}>▾</span>
            )}
          </SidebarItem>
        ))}
      </Sidebar>

      <MainContent>
        <ContentHeader>
          <ContentActions>
            <ContentBtn>+ New record</ContentBtn>
            <ContentBtn>✧ Enrich</ContentBtn>
            <ContentBtn>✎ Edit actions</ContentBtn>
          </ContentActions>
        </ContentHeader>
        <WidgetCard>
          <WidgetTitle>Widget name</WidgetTitle>
          <WidgetFieldRow>
            <FieldDot>●</FieldDot>
            <FieldLabel>URL</FieldLabel>
            <FieldValue>qonto.com</FieldValue>
          </WidgetFieldRow>
          <WidgetFieldRow>
            <FieldDot>●</FieldDot>
            <FieldLabel>Account O...</FieldLabel>
            <FieldValue>Phil Schiller</FieldValue>
          </WidgetFieldRow>
          <WidgetFieldRow>
            <FieldDot>●</FieldDot>
            <FieldLabel>Address</FieldLabel>
            <FieldValue>18 Rue De Navarin, 750</FieldValue>
          </WidgetFieldRow>
          <WidgetFieldRow>
            <FieldDot>●</FieldDot>
            <FieldLabel>ICP</FieldLabel>
            <FieldValue>✓ True</FieldValue>
          </WidgetFieldRow>
        </WidgetCard>
      </MainContent>

      <RightPanel onPointerMove={handleDragMove} onPointerUp={handleDragEnd}>
        <PanelHeader>
          <PanelBackBtn>‹</PanelBackBtn>
          <PanelIcon>⊞</PanelIcon>
          <PanelTitle>Fields widget</PanelTitle>
          <PanelPinBtn>⊹</PanelPinBtn>
        </PanelHeader>

        <EditableSection>
          <EditInput>
            <EditInputText>General</EditInputText>
            <DoneBtn>Done</DoneBtn>
          </EditInput>
        </EditableSection>

        {sections.map((section) => (
          <div key={section}>
            <SectionHeader
              $expanded={expandedSections.has(section)}
              onClick={() => toggleSection(section)}
            >
              <SectionChevron $expanded={expandedSections.has(section)}>
                ›
              </SectionChevron>
              {section}
            </SectionHeader>
            {expandedSections.has(section) &&
              fields
                .filter((field) => field.section === section)
                .map((field) => (
                  <DraggableField
                    key={field.id}
                    $dragging={draggingId === field.id}
                    $visible={field.visible}
                    onPointerDown={(event) => handleDragStart(field.id, event)}
                  >
                    <DragHandle>⋮⋮</DragHandle>
                    <DragFieldIcon>{field.icon}</DragFieldIcon>
                    <DragFieldLabel>
                      {field.label} · {field.type}
                    </DragFieldLabel>
                    <VisibilityBtn
                      $visible={field.visible}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleVisibility(field.id);
                      }}
                    >
                      {field.visible ? '◉' : '◎'}
                    </VisibilityBtn>
                  </DraggableField>
                ))}
          </div>
        ))}
      </RightPanel>
    </Canvas>
  );
}
