'use client';

import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import { sharedAssetUrls } from '@/app-preview/data/shared-asset-urls';
import { getElementScale } from '@/platform/motion';
import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { STEPPER_SHELL_CHROME } from '../components/ProductStepperShell';
import { LAYOUT_GLYPHS } from './components/LayoutIcons';
import { LAYOUT_CHROME } from './components/layout-chrome';
import { LAYOUT_EDITOR_CONTENT } from './data/layout-data';

const {
  ChevronDown: ChevronDownGlyph,
  ChevronLeft: ChevronLeftGlyph,
  Dots: DotsGlyph,
  Eye: EyeGlyph,
  Field: FieldGlyph,
  Grip: GripGlyph,
  List: ListGlyph,
  Nav: NavGlyph,
  NewFields: NewFieldsGlyph,
  NewSection: NewSectionGlyph,
  Spark: SparkGlyph,
} = LAYOUT_GLYPHS;

const {
  ActionButton,
  ActionsBar,
  AddIconBox,
  AddSectionRow,
  AddText,
  DoneButton,
  EditField,
  EditGroup,
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
  PanelActionButton,
  PanelBackButton,
  PanelFields,
  PanelHeader,
  PanelIconBox,
  PanelSubBar,
  PanelSubLabel,
  PanelTitleBold,
  PanelTitleGroup,
  RightPanel,
  SectionName,
  SectionRow,
  WidgetAvatar,
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

const LAYOUT_DESIGN = { height: 496, width: 473 };

const ROW_STEP_PX = 22;

export function LayoutVisual({ active }: { active: boolean }) {
  const [fields, setFields] = useState(LAYOUT_EDITOR_CONTENT.fields);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragStartY = useRef(0);
  const dragScale = useRef(1);
  const { i18n } = useLingui();

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
    dragScale.current = getElementScale(event.currentTarget);
  };

  const handleDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingId) {
      return;
    }
    const deltaY = (event.clientY - dragStartY.current) / dragScale.current;
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
          baseScale={1.35}
          designHeight={LAYOUT_DESIGN.height}
          designWidth={LAYOUT_DESIGN.width}
          zoom={1.05}
        >
          <WidgetPanel>
            <WidgetInner>
              <WidgetSectionLabel>
                {i18n._(msg`General`)}
                <ChevronDownGlyph />
              </WidgetSectionLabel>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="link" />
                </WidgetIcon>
                <WidgetLabel>{i18n._(msg`URL`)}</WidgetLabel>
                <WidgetChip>anthropic.com</WidgetChip>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="user" />
                </WidgetIcon>
                <WidgetLabel>{i18n._(msg`Account Owner`)}</WidgetLabel>
                <WidgetValue>
                  <WidgetAvatar
                    alt=""
                    fetchPriority="low"
                    src={sharedAssetUrls.peopleAvatars.anonymousFelix}
                  />
                  Félix Malfait
                </WidgetValue>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="map" />
                </WidgetIcon>
                <WidgetLabel>{i18n._(msg`Address`)}</WidgetLabel>
                <WidgetValue>548 Market St, San Fr...</WidgetValue>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="target" />
                </WidgetIcon>
                <WidgetLabel>{i18n._(msg`ICP`)}</WidgetLabel>
                <WidgetValue>✓ True</WidgetValue>
              </WidgetRow>
              <WidgetRow>
                <WidgetIcon>
                  <FieldGlyph type="money" />
                </WidgetIcon>
                <WidgetLabel>{i18n._(msg`Revenue`)}</WidgetLabel>
                <WidgetValue>$500,000</WidgetValue>
              </WidgetRow>
            </WidgetInner>
          </WidgetPanel>

          <NavPanel>
            <NavSectionLabel>{i18n._(msg`Workspace`)}</NavSectionLabel>
            {LAYOUT_EDITOR_CONTENT.navItems.map((item) => (
              <div key={item.icon}>
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
                  {i18n._(item.label)}
                  {item.isFolder ? <NavChevron>▾</NavChevron> : null}
                </NavItem>
                {item.children?.map((child) => (
                  <NavSubItem key={child.icon}>
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
                    {i18n._(child.label)}
                  </NavSubItem>
                ))}
              </div>
            ))}
          </NavPanel>

          <ActionsBar>
            <ActionButton>+ {i18n._(msg`New record`)}</ActionButton>
            <ActionButton>✧ {i18n._(msg`Enrich`)}</ActionButton>
            <ActionButton>✎ {i18n._(msg`Edit actions`)}</ActionButton>
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
                <PanelTitleBold>{i18n._(msg`Fields`)}</PanelTitleBold>
              </PanelTitleGroup>
              <PanelActionButton>
                <SparkGlyph />
              </PanelActionButton>
            </PanelHeader>

            <PanelSubBar>
              <PanelBackButton>
                <ChevronLeftGlyph />
              </PanelBackButton>
              <PanelSubLabel>{i18n._(msg`Layout`)}</PanelSubLabel>
            </PanelSubBar>

            <PanelFields>
              {sections.map((section, sectionNumber) => (
                <div key={section}>
                  <SectionRow>
                    <GripGlyph />
                    <SectionName>
                      {i18n._(LAYOUT_EDITOR_CONTENT.sectionLabels[section])}
                    </SectionName>
                    <PanelActionButton>
                      <DotsGlyph />
                    </PanelActionButton>
                  </SectionRow>

                  {fields
                    .filter((field) => field.section === section)
                    .map((field, fieldNumber) => {
                      const isEditing =
                        sectionNumber === 0 && fieldNumber === 0;

                      return (
                        <FieldRow
                          data-dragging={
                            draggingId === field.id ? '' : undefined
                          }
                          data-editing={isEditing ? '' : undefined}
                          key={field.id}
                          onPointerDown={
                            isEditing
                              ? undefined
                              : (event) => handleDragStart(field.id, event)
                          }
                        >
                          <FieldIconBox>
                            <FieldGlyph type={field.icon} />
                          </FieldIconBox>
                          {isEditing ? (
                            <EditGroup>
                              <EditField>{i18n._(msg`General`)}</EditField>
                              <DoneButton>{i18n._(msg`Done`)}</DoneButton>
                            </EditGroup>
                          ) : (
                            <FieldLabels>
                              <FieldName>{i18n._(field.label)}</FieldName>
                              <FieldDot>·</FieldDot>
                              <FieldType>{i18n._(field.type)}</FieldType>
                            </FieldLabels>
                          )}
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
                      );
                    })}

                  {sectionNumber > 0 && sectionNumber < sections.length - 1 ? (
                    <AddSectionRow>
                      <AddIconBox>
                        <NewSectionGlyph />
                      </AddIconBox>
                      <AddText>{i18n._(msg`Add a Section`)}</AddText>
                    </AddSectionRow>
                  ) : null}
                </div>
              ))}

              <FieldRow data-static="">
                <FieldIconBox>
                  <NewFieldsGlyph />
                </FieldIconBox>
                <FieldLabels>
                  <FieldName>{i18n._(msg`New fields`)}</FieldName>
                  <FieldDot>·</FieldDot>
                  <FieldType>
                    {i18n._(msg`Default position/visibility for field…`)}
                  </FieldType>
                </FieldLabels>
                <PanelActionButton>
                  <EyeGlyph visible />
                </PanelActionButton>
                <PanelActionButton>
                  <DotsGlyph />
                </PanelActionButton>
              </FieldRow>

              <AddSectionRow>
                <AddIconBox>
                  <NewSectionGlyph />
                </AddIconBox>
                <AddText>{i18n._(msg`Add a Section`)}</AddText>
              </AddSectionRow>
            </PanelFields>
          </RightPanel>
        </StageFit>
      </Canvas>
    </Shell>
  );
}
