import {
  IconBuildingSkyscraper,
  IconCalendar,
  IconCheckbox,
  IconChevronLeft,
  IconCurrencyDollar,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconHistoryToggle,
  IconLayoutDashboard,
  IconLink,
  IconList,
  IconMapPin,
  IconNotes,
  IconPlus,
  IconSettingsAutomation,
  IconSparkles,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
  IconVersions,
} from '@tabler/icons-react';

import { PRODUCT_STEPPER_SCENE } from '@/tokens/feature-scenes/product-stepper-scene';

import { type LayoutFieldIconType } from '../types/layout-field-icon-type';
import { type LayoutNavIconType } from '../types/layout-nav-icon-type';

const inks = PRODUCT_STEPPER_SCENE.layout;

const FIELD_ICONS: Record<LayoutFieldIconType, typeof IconLink> = {
  calendar: IconCalendar,
  link: IconLink,
  map: IconMapPin,
  money: IconCurrencyDollar,
  target: IconTargetArrow,
  user: IconUserCircle,
  users: IconUsers,
};

const NAV_ICONS: Record<LayoutNavIconType, typeof IconLink> = {
  automation: IconSettingsAutomation,
  building: IconBuildingSkyscraper,
  checkbox: IconCheckbox,
  dashboard: IconLayoutDashboard,
  history: IconHistoryToggle,
  notes: IconNotes,
  target: IconTargetArrow,
  user: IconUser,
  versions: IconVersions,
};

function FieldGlyph({ type }: { type: LayoutFieldIconType }) {
  const IconComponent = FIELD_ICONS[type];
  return <IconComponent color={inks.fieldInk} size={12} stroke={1.6} />;
}

function NavGlyph({ color, type }: { color: string; type: LayoutNavIconType }) {
  const IconComponent = NAV_ICONS[type];
  return <IconComponent color={color} size={11} stroke={1.8} />;
}

function EyeGlyph({ visible }: { visible: boolean }) {
  return visible ? (
    <IconEye color={inks.eyeInk} size={11} stroke={1.6} />
  ) : (
    <IconEyeOff color={inks.eyeHiddenInk} size={11} stroke={1.6} />
  );
}

function ChevronLeftGlyph() {
  return <IconChevronLeft color={inks.eyeInk} size={12} stroke={1.6} />;
}

function DotsGlyph() {
  return <IconDotsVertical color={inks.eyeInk} size={12} stroke={1.8} />;
}

function GripGlyph() {
  return <IconGripVertical color={inks.eyeInk} size={12} stroke={1.8} />;
}

function ListGlyph() {
  return <IconList color={inks.fieldInk} size={11} stroke={1.6} />;
}

function SparkGlyph() {
  return <IconSparkles color={inks.eyeInk} size={11} stroke={1.6} />;
}

function NewSectionGlyph() {
  return <IconPlus color={inks.fieldInk} size={11} stroke={1.6} />;
}

function PlusGlyph() {
  return <IconPlus color={inks.fieldInk} size={11} stroke={1.6} />;
}

export const LAYOUT_GLYPHS = {
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
};
