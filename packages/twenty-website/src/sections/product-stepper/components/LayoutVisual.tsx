'use client';

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { LAYOUT_CHROME } from '../data/layout-chrome';
import { LAYOUT_EDITOR_CONTENT } from '../data/layout-data';
import { LAYOUT_GLYPHS } from './LayoutIcons';
import { STEPPER_SHELL_CHROME } from './ProductStepperShell';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const {
  ChevronLeft: ChevronLeftGlyph,
  Dots: DotsGlyph,
  Eye: EyeGlyph,
  Field: FieldGlyph,
  Grip: GripGlyph,
  List: ListGlyph,
  Nav: NavGlyph,
  NewSection: NewSectionGlyph,
  Plus: PlusGlyph,
  Spark: SparkGlyph,
} = LAYOUT_GLYPHS;

const {
  ActionButton,
  ActionsBar,
  AddIconBox,
  AddSectionRow,
  AddText,
  DoneButton,
  EditableRow,
  EditableText,
  FieldDot,
  FieldIconBox,
  FieldLabels,
  FieldName,
  FieldRow,
  FieldType,
  NavBreadcrumb,
  NavChevron,
  NavIconBox,
  NavItem,
  NavPanel,
  NavSectionLabel,
  NavSubItem,
  NewFieldsColumn,
  NewFieldsDescription,
  NewFieldsRow,
  NewFieldsTitle,
  PanelActionButton,
  PanelBackButton,
  PanelFields,
  PanelHeader,
  PanelIconBox,
  PanelSubBar,
  PanelSubLabel,
  PanelTitleBold,
  PanelTitleGroup,
  PanelTitleSub,
  RightPanel,
  SectionName,
  SectionRow,
  WidgetChip,
  WidgetIcon,
  WidgetInner,
  WidgetLabel,
  WidgetPanel,
  WidgetRow,
  WidgetSectionLabel,
  WidgetValue,
} = LAYOUT_CHROME;

const { Canvas, Shell, StageFit } = STEPPER_SHELL_CHROME;

const LAYOUT_DESIGN = { height: 620, width: 591 };

const ROW_STEP_PX = 22;

export function LayoutVisual({ active }: { active: boolean }) {
  const [fields, setFields] = useState(LAYOUT_EDITOR_CONTENT.fields);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartY = useRef(0);

  const toggleVisibility = (fieldId: string) => {
    setFields((previous) =>
      previous.map((field) =>
        field.id === fieldId ? { ...field, visible: !field.visible } : field,
      ),
    );
  };

  const handleDragStart = (
    fieldId: string,
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingId(fieldId);
    dragStartY.current = event.clientY;
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingId) {
      return;
    }
    const deltaY = event.clientY - dragStartY.current;
    const steps = Math.round(deltaY / ROW_STEP_PX);

    if (steps === 0) {
      return;
    }
    setFields((previous) => {
      const index = previous.findIndex((field) => field.id === draggingId);

      if (index === -1) {
        return previous;
      }
      const target = Math.max(0, Math.min(previous.length - 1, index + steps));

      if (target === index) {
        return previous;
      }
      const next = [...previous];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next;
    });
    dragStartY.current = event.clientY;
  };

  const handleDragEnd = () => setDraggingId(null);
  const handleLostCapture = () => {
    if (draggingId) {
      setDraggingId(null);
    }
  };
  const sections = [...new Set(fields.map((field) => field.section))];

  return (
    <Shell active={active}>
      <Canvas>
        <StageFit
          baseScale={1.05}
          designHeight={LAYOUT_DESIGN.height}
          designWidth={LAYOUT_DESIGN.width}
          zoom={1.05}
        >
          <WidgetPanel>
            <WidgetInner>
              <WidgetSectionLabel>General</WidgetSectionLabel>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="link" />
                </WidgetIcon>
                <WidgetLabel>URL</WidgetLabel>
                <WidgetChip>anthropic.com</WidgetChip>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="user" />
                </WidgetIcon>
                <WidgetLabel>Account O...</WidgetLabel>
                <WidgetValue>Félix Malfait</WidgetValue>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="map" />
                </WidgetIcon>
                <WidgetLabel>Address</WidgetLabel>
                <WidgetValue>548 Market St, San Fr...</WidgetValue>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="target" />
                </WidgetIcon>
                <WidgetLabel>ICP</WidgetLabel>
                <WidgetValue>✓ True</WidgetValue>
              </WidgetRow>
            </WidgetInner>
          </WidgetPanel>

          <NavPanel>
            <NavSectionLabel>Workspace</NavSectionLabel>
            {LAYOUT_EDITOR_CONTENT.navItems.map((item) => (
              <div key={item.label}>
                <NavItem data-active={item.isActive ? '' : undefined}>
                  <NavIconBox
                    $background={
                      PRODUCT_STEPPER_SCENE.navTiles[item.color].background
                    }
                    $border={PRODUCT_STEPPER_SCENE.navTiles[item.color].border}
                  >
                    <NavGlyph
                      color={PRODUCT_STEPPER_SCENE.navTiles[item.color].icon}
                      type={item.icon}
                    />
                  </NavIconBox>
                  {item.label}
                  {item.isFolder ? <NavChevron>▾</NavChevron> : null}
                </NavItem>
                {item.children?.map((child) => (
                  <NavSubItem key={child.label}>
                    <NavBreadcrumb />
                    <NavIconBox
                      $background={
                        PRODUCT_STEPPER_SCENE.navTiles[child.color].background
                      }
                      $border={
                        PRODUCT_STEPPER_SCENE.navTiles[child.color].border
                      }
                    >
                      <NavGlyph
                        color={PRODUCT_STEPPER_SCENE.navTiles[child.color].icon}
                        type={child.icon}
                      />
                    </NavIconBox>
                    {child.label}
                  </NavSubItem>
                ))}
              </div>
            ))}
          </NavPanel>

          <ActionsBar>
            <ActionButton>+ New record</ActionButton>
            <ActionButton>✧ Enrich</ActionButton>
            <ActionButton>✎ Edit actions</ActionButton>
          </ActionsBar>

          <RightPanel
            onLostPointerCapture={handleLostCapture}
            onPointerCancel={handleDragEnd}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            <PanelHeader>
              <PanelBackButton>
                <ChevronLeftGlyph />
              </PanelBackButton>
              <PanelIconBox>
                <ListGlyph />
              </PanelIconBox>
              <PanelTitleGroup>
                <PanelTitleBold>Fields</PanelTitleBold>
                <PanelTitleSub>Fields widget</PanelTitleSub>
              </PanelTitleGroup>
              <PanelActionButton>
                <SparkGlyph />
              </PanelActionButton>
            </PanelHeader>

            <PanelSubBar>
              <PanelBackButton>
                <ChevronLeftGlyph />
              </PanelBackButton>
              <PanelSubLabel>Layout</PanelSubLabel>
            </PanelSubBar>

            <PanelFields>
              {sections.map((section, sectionNumber) => (
                <div key={section}>
                  <SectionRow>
                    <GripGlyph />
                    <SectionName>{section}</SectionName>
                    <PanelActionButton>
                      <DotsGlyph />
                    </PanelActionButton>
                  </SectionRow>

                  {sectionNumber === 0 ? (
                    <EditableRow>
                      <EditableText>Industry</EditableText>
                      <DoneButton>Done</DoneButton>
                    </EditableRow>
                  ) : null}

                  {fields
                    .filter((field) => field.section === section)
                    .map((field) => (
                      <FieldRow
                        data-dragging={draggingId === field.id ? '' : undefined}
                        key={field.id}
                        onPointerDown={(event) =>
                          handleDragStart(field.id, event)
                        }
                      >
                        <FieldIconBox>
                          <FieldGlyph type={field.icon} />
                        </FieldIconBox>
                        <FieldLabels>
                          <FieldName>{field.label}</FieldName>
                          <FieldDot>·</FieldDot>
                          <FieldType>{field.type}</FieldType>
                        </FieldLabels>
                        <PanelActionButton
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleVisibility(field.id);
                          }}
                        >
                          <EyeGlyph visible={field.visible} />
                        </PanelActionButton>
                        <PanelActionButton>
                          <DotsGlyph />
                        </PanelActionButton>
                      </FieldRow>
                    ))}

                  {sectionNumber > 0 && sectionNumber < sections.length - 1 ? (
                    <AddSectionRow>
                      <AddIconBox>
                        <NewSectionGlyph />
                      </AddIconBox>
                      <AddText>Add a Section</AddText>
                    </AddSectionRow>
                  ) : null}
                </div>
              ))}

              <NewFieldsRow>
                <AddIconBox>
                  <PlusGlyph />
                </AddIconBox>
                <NewFieldsColumn>
                  <NewFieldsTitle>New fields</NewFieldsTitle>
                  <NewFieldsDescription>
                    Default position/visibility for field…
                  </NewFieldsDescription>
                </NewFieldsColumn>
              </NewFieldsRow>

              <AddSectionRow>
                <AddIconBox>
                  <NewSectionGlyph />
                </AddIconBox>
                <AddText>Add a Section</AddText>
              </AddSectionRow>
            </PanelFields>
          </RightPanel>
        </StageFit>
      </Canvas>
    </Shell>
  );
}
