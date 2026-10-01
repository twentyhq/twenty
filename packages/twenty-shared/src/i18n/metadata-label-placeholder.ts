import { capitalize } from '../utils/strings/capitalize';
import { isDefined } from '../utils/validation/isDefined';

export const METADATA_LABEL_PLACEHOLDER_NAMES = [
  'objectLabel',
  'objectLabelSingular',
  'objectLabelPlural',
  'objectIcon',
] as const;

export type MetadataLabelPlaceholderName =
  (typeof METADATA_LABEL_PLACEHOLDER_NAMES)[number];

// The subset an object metadata can fill; objectLabel is left out as it follows the record selection, which only the client knows.
export const OBJECT_METADATA_LABEL_PLACEHOLDER_NAMES = [
  'objectLabelSingular',
  'objectLabelPlural',
  'objectIcon',
] as const satisfies readonly MetadataLabelPlaceholderName[];

export type MetadataLabelPlaceholderValues = Partial<
  Record<MetadataLabelPlaceholderName, string>
>;

export const getMetadataLabelPlaceholder = (
  name: MetadataLabelPlaceholderName,
): string => `{${name}}`;

// Lingui drops ICU arguments it is not given, so pass placeholders through as their own values.
export const METADATA_LABEL_PLACEHOLDER_PASS_THROUGH: Record<
  MetadataLabelPlaceholderName,
  string
> = Object.fromEntries(
  METADATA_LABEL_PLACEHOLDER_NAMES.map((name) => [
    name,
    getMetadataLabelPlaceholder(name),
  ]),
) as Record<MetadataLabelPlaceholderName, string>;

// A placeholder can start a label, so the value carries the casing.
const capitalizeLabel = (label?: string | null): string | undefined =>
  isDefined(label) ? capitalize(label) : undefined;

export const buildObjectMetadataLabelPlaceholderValues = ({
  label,
  labelSingular,
  labelPlural,
  icon,
}: {
  label?: string | null;
  labelSingular?: string | null;
  labelPlural?: string | null;
  icon?: string | null;
}): MetadataLabelPlaceholderValues => ({
  objectLabel: capitalizeLabel(label),
  objectLabelSingular: capitalizeLabel(labelSingular),
  objectLabelPlural: capitalizeLabel(labelPlural),
  objectIcon: icon ?? undefined,
});

export const hasObjectMetadataLabelPlaceholder = (message: string): boolean =>
  OBJECT_METADATA_LABEL_PLACEHOLDER_NAMES.some((name) =>
    message.includes(getMetadataLabelPlaceholder(name)),
  );
