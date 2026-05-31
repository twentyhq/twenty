'use client';

import { useRef, useState } from 'react';

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
} from './icons/LayoutIcons';
import {
  ActionBtn,
  ActionsBar,
  BlueHeader,
  Canvas,
  HeaderCenter,
  HeaderLeft,
  HeaderSave,
  HeaderTitle,
  MainCard,
  NavBreadcrumb,
  NavChevron,
  NavIconBox,
  NavItem,
  NavPanel,
  NavSectionLabel,
  NavSubItem,
  NavSuffix,
  RightPanel,
  RPActionBtn,
  RPAddIconBox,
  RPAddSection,
  RPAddText,
  RPBackBtn,
  RPDoneBtn,
  RPEditable,
  RPEditText,
  RPFieldDot,
  RPFieldIconBox,
  RPFieldLabels,
  RPFieldName,
  RPFieldRow,
  RPFieldType,
  RPFields,
  RPHeader,
  RPIconBox,
  RPNewDesc,
  RPNewFields,
  RPNewTitle,
  RPSectionName,
  RPSectionRow,
  RPSubBar,
  RPSubLabel,
  RPTitleBold,
  RPTitleGroup,
  RPTitleSub,
  WChip,
  WIcon,
  WLabel,
  WRow,
  WSectionLabel,
  WValue,
  WidgetInner,
  WidgetPanel,
  WidgetTitle,
} from './layout-styles';

export function LayoutVisual({ active }: StepperVisualProps) {
  const [fields, setFields] = useState(FIELDS);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartY = useRef(0);

  const toggleVisibility = (fieldId: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, visible: !f.visible } : f)),
    );
  };

  const handleDragStart = (fieldId: string, event: React.PointerEvent) => {
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    setDraggingId(fieldId);
    dragStartY.current = event.clientY;
  };

  const handleDragMove = (event: React.PointerEvent) => {
    if (!draggingId) return;
    const dy = event.clientY - dragStartY.current;
    const steps = Math.round(dy / 22);
    if (steps === 0) return;
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.id === draggingId);
      if (idx === -1) return prev;
      const to = Math.max(0, Math.min(prev.length - 1, idx + steps));
      if (to === idx) return prev;
      const next = [...prev];
      const [moved] = next.splice(idx, 1);
      next.splice(to, 0, moved);
      return next;
    });
    dragStartY.current = event.clientY;
  };

  const handleDragEnd = () => setDraggingId(null);
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

      <RightPanel
        onPointerCancel={handleDragEnd}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
      >
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
