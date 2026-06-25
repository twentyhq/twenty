import { styled } from '@linaria/react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

const shell = PRODUCT_STEPPER_SCENE.shell;
const layout = PRODUCT_STEPPER_SCENE.layout;

const PANEL_RADIUS = '3px';

const Canvas = styled.div`
  font-family: ${shell.font};
  height: 100%;
  opacity: 0.6;
  position: relative;
  transition: opacity 0.3s;
  width: 100%;

  &[data-active] {
    opacity: 1;
  }
`;

const WidgetPanel = styled.div`
  backdrop-filter: blur(5px);
  background: ${layout.glass};
  border: 0.8px solid ${layout.accent};
  border-radius: ${PANEL_RADIUS};
  left: 48%;
  max-height: 36%;
  overflow: hidden;
  padding: 6px;
  position: absolute;
  top: 18%;
  width: 38%;
`;

const WidgetInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const WidgetTitle = styled.div`
  color: ${shell.text};
  font-size: 10px;
  font-weight: 600;
  padding: 2px 3px;
`;

const WidgetSectionLabel = styled.div`
  color: ${shell.textTertiary};
  font-size: 7px;
  font-weight: 600;
  padding: 0 3px;
`;

const WidgetRow = styled.div`
  align-items: center;
  display: flex;
  gap: 3px;
  min-height: 16px;
  padding: 1px 3px;
`;

const WidgetIcon = styled.span`
  align-items: center;
  color: ${shell.textTertiary};
  display: flex;
  flex-shrink: 0;
  height: 10px;
  justify-content: center;
  width: 10px;
`;

const WidgetLabel = styled.span`
  color: ${shell.textTertiary};
  flex-shrink: 0;
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 58px;
`;

const WidgetValue = styled.span`
  color: ${shell.text};
  flex: 1;
  font-size: 8px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const WidgetChip = styled.span`
  background: ${layout.chipWash};
  border: 0.5px solid ${shell.borderStrong};
  border-radius: 50px;
  color: ${shell.text};
  font-size: 8px;
  padding: 1px 6px;
`;

const NavPanel = styled.div`
  backdrop-filter: blur(5px);
  background: ${layout.glass};
  border: 0.8px solid ${layout.accent};
  border-radius: ${PANEL_RADIUS};
  left: 8%;
  max-height: 68%;
  overflow-y: auto;
  padding: 8px;
  position: absolute;
  top: 13%;
  width: 30%;
`;

const NavSectionLabel = styled.div`
  color: ${shell.textTertiary};
  font-size: 8px;
  font-weight: 600;
  padding: 4px 3px;
`;

const NavItem = styled.div`
  align-items: center;
  background: transparent;
  border-radius: ${PANEL_RADIUS};
  color: ${shell.textSecondary};
  cursor: pointer;
  display: flex;
  font-size: 9px;
  font-weight: 500;
  gap: 5px;
  padding: 5px 4px;

  &[data-active] {
    background: ${shell.tint};
    color: ${shell.text};
  }
`;

const NavIconBox = styled.span<{ $tint: string }>`
  align-items: center;
  background: ${({ $tint }) => $tint};
  border: 0.5px solid ${shell.borderStrong};
  border-radius: 3px;
  display: flex;
  flex-shrink: 0;
  height: 13px;
  justify-content: center;
  width: 13px;
`;

const NavSubItem = styled.div`
  align-items: center;
  color: ${shell.textSecondary};
  display: flex;
  font-size: 8px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 4px 4px 16px;
`;

const NavBreadcrumb = styled.span`
  border-bottom: 0.5px solid ${shell.borderStrong};
  border-left: 0.5px solid ${shell.borderStrong};
  border-radius: 0 0 0 2px;
  flex-shrink: 0;
  height: 8px;
  margin-left: -6px;
  width: 4px;
`;

const NavSuffix = styled.span`
  color: ${shell.textTertiary};
  font-size: 6px;
`;

const NavChevron = styled.span`
  color: ${shell.textTertiary};
  font-size: 6px;
  margin-left: auto;
`;

const ActionsBar = styled.div`
  backdrop-filter: blur(5px);
  background: ${layout.glass};
  border: 0.8px solid ${layout.accent};
  border-radius: ${PANEL_RADIUS};
  display: flex;
  gap: 5px;
  left: 52%;
  padding: 5px 6px;
  position: absolute;
  top: 12%;
  z-index: 3;
`;

const ActionButton = styled.span`
  border: 0.8px solid ${shell.borderSubtle};
  border-radius: ${PANEL_RADIUS};
  color: ${shell.textSecondary};
  font-size: 8px;
  font-weight: 500;
  padding: 3px 6px;
`;

const RightPanel = styled.div`
  backdrop-filter: blur(5px);
  background: ${layout.glass};
  border: 0.8px solid ${layout.panelAccent};
  border-radius: ${PANEL_RADIUS};
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

const PanelHeader = styled.div`
  align-items: center;
  border-bottom: 0.8px solid ${shell.borderMedium};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 6px;
`;

const PanelBackButton = styled.span`
  align-items: center;
  color: ${shell.textTertiary};
  cursor: pointer;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const PanelIconBox = styled.span`
  align-items: center;
  background: ${shell.tint};
  border-radius: 3px;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const PanelTitleGroup = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  gap: 3px;
  min-width: 0;
`;

const PanelTitleBold = styled.span`
  color: ${shell.text};
  font-size: 9px;
  font-weight: 600;
`;

const PanelTitleSub = styled.span`
  color: ${shell.textTertiary};
  font-size: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PanelSubBar = styled.div`
  align-items: center;
  border-bottom: 0.8px solid ${shell.borderLight};
  display: flex;
  flex-shrink: 0;
  gap: 3px;
  padding: 5px 6px;
`;

const PanelSubLabel = styled.span`
  color: ${shell.textTertiary};
  font-size: 8px;
  font-weight: 500;
`;

const PanelFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  overflow-y: auto;
  padding: 6px;
`;

const SectionRow = styled.div`
  align-items: center;
  display: flex;
  gap: 5px;
  padding: 3px;
`;

const SectionName = styled.span`
  color: ${shell.textTertiary};
  flex: 1;
  font-size: 7px;
  font-weight: 600;
`;

const EditableRow = styled.div`
  align-items: center;
  background: white;
  border: 1px solid ${layout.accent};
  border-radius: ${PANEL_RADIUS};
  display: flex;
  gap: 4px;
  margin: 2px 0 4px;
  padding: 4px 6px;
`;

const EditableText = styled.span`
  color: ${shell.text};
  flex: 1;
  font-size: 9px;
`;

const DoneButton = styled.span`
  background: ${layout.accent};
  border-radius: 3px;
  color: white;
  cursor: pointer;
  font-size: 7px;
  font-weight: 600;
  padding: 2px 8px;
`;

const FieldRow = styled.div`
  align-items: center;
  background: transparent;
  border-radius: ${PANEL_RADIUS};
  cursor: grab;
  display: flex;
  gap: 5px;
  padding: 3px;
  touch-action: none;

  &[data-dragging] {
    background: ${layout.dragWash};
  }

  &:active {
    cursor: grabbing;
  }
`;

const FieldIconBox = styled.span`
  align-items: center;
  background: ${shell.tint};
  border-radius: 3px;
  display: flex;
  flex-shrink: 0;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const FieldLabels = styled.div`
  align-items: baseline;
  display: flex;
  flex: 1;
  font-size: 8px;
  gap: 3px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
`;

const FieldName = styled.span`
  color: ${shell.textSecondary};
  flex-shrink: 0;
`;

const FieldDot = styled.span`
  color: ${shell.textTertiary};
`;

const FieldType = styled.span`
  color: ${shell.textTertiary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PanelActionButton = styled.span`
  cursor: pointer;
  display: flex;
`;

const AddSectionRow = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 5px;
  padding: 3px;
`;

const AddIconBox = styled.span`
  align-items: center;
  background: ${shell.tint};
  border-radius: 3px;
  display: flex;
  height: 16px;
  justify-content: center;
  width: 16px;
`;

const AddText = styled.span`
  color: ${shell.textSecondary};
  font-size: 8px;
`;

const NewFieldsRow = styled.div`
  align-items: center;
  border-top: 0.8px solid ${shell.borderMedium};
  display: flex;
  gap: 5px;
  margin-top: 4px;
  padding: 6px 3px 3px;
`;

const NewFieldsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const NewFieldsTitle = styled.span`
  color: ${shell.textSecondary};
  font-size: 8px;
`;

const NewFieldsDescription = styled.span`
  color: ${shell.textTertiary};
  font-size: 7px;
`;

export const LAYOUT_CHROME = {
  ActionButton,
  ActionsBar,
  AddIconBox,
  AddSectionRow,
  AddText,
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
};
