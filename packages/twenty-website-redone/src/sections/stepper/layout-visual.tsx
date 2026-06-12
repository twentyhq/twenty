'use client';

import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { LAYOUT_CHROME } from './layout-chrome';
import { LAYOUT_EDITOR_CONTENT } from './layout-data';
import { LAYOUT_GLYPHS } from './layout-icons';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const {
  Check: CheckGlyph,
  ChevronLeft: ChevronLeftGlyph,
  Dots: DotsGlyph,
  DotsWhite: DotsWhiteGlyph,
  Eye: EyeGlyph,
  Field: FieldGlyph,
  Grip: GripGlyph,
  List: ListGlyph,
  Nav: NavGlyph,
  NewSection: NewSectionGlyph,
  Paint: PaintGlyph,
  Plus: PlusGlyph,
  Spark: SparkGlyph,
} = LAYOUT_GLYPHS;

const {
  ActionButton,
  ActionsBar,
  AddIconBox,
  AddSectionRow,
  AddText,
  BlueHeader,
  Canvas,
  DoneButton,
  EditableRow,
  EditableText,
  FieldDot,
  FieldIconBox,
  FieldLabels,
  FieldName,
  FieldRow,
  FieldType,
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
  WidgetTitle,
  WidgetValue,
} = LAYOUT_CHROME;

// One field row is 22px tall; vertical drag distance converts to reorder
// steps at that grain (verbatim mechanism — discrete splices).
const ROW_STEP_PX = 22;

// The layout editor: glass panels over the record page, with the fields
// list reorderable by drag and visibility toggled per row.
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
  const sections = [...new Set(fields.map((field) => field.section))];

  return (
    <Canvas data-active={active ? '' : undefined}>
      <MainCard>
        <BlueHeader>
          <HeaderLeft>
            <DotsWhiteGlyph />
          </HeaderLeft>
          <HeaderCenter>
            <PaintGlyph />
            <HeaderTitle>Layout edition</HeaderTitle>
          </HeaderCenter>
          <HeaderSave>
            <CheckGlyph /> Save
          </HeaderSave>
        </BlueHeader>
      </MainCard>

      <WidgetPanel>
        <WidgetInner>
          <WidgetTitle>Widget name</WidgetTitle>
          <WidgetSectionLabel>General</WidgetSectionLabel>
          <WidgetRow>
            <WidgetIcon>
              <FieldGlyph type="link" />
            </WidgetIcon>
            <WidgetLabel>URL</WidgetLabel>
            <WidgetChip>qonto.com</WidgetChip>
          </WidgetRow>
          <WidgetRow>
            <WidgetIcon>
              <FieldGlyph type="user" />
            </WidgetIcon>
            <WidgetLabel>Account O...</WidgetLabel>
            <WidgetValue>Phil Schiller</WidgetValue>
          </WidgetRow>
          <WidgetRow>
            <WidgetIcon>
              <FieldGlyph type="map" />
            </WidgetIcon>
            <WidgetLabel>Address</WidgetLabel>
            <WidgetValue>18 Rue De Navarin, 750...</WidgetValue>
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
                $tint={PRODUCT_STEPPER_SCENE.navTints[item.background]}
              >
                <NavGlyph type={item.icon} />
              </NavIconBox>
              {item.label}
              {item.suffix ? <NavSuffix>· {item.suffix}</NavSuffix> : null}
              {item.isFolder ? <NavChevron>▾</NavChevron> : null}
            </NavItem>
            {item.children?.map((child) => (
              <NavSubItem key={child.label}>
                <NavBreadcrumb />
                <NavIconBox
                  $tint={PRODUCT_STEPPER_SCENE.navTints[child.background]}
                >
                  <NavGlyph type={child.icon} />
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
                    onPointerDown={(event) => handleDragStart(field.id, event)}
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
    </Canvas>
  );
}
