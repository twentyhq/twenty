import type * as TablerIcons from '@ui/icon/components/TablerIcons';
import { type ResolvableIconName } from '@ui/icon/providers/internal/AllIcons';

type ExportedIconName = Extract<keyof typeof TablerIcons, `Icon${string}`>;

type IconsExportedButNotResolvableByName = Exclude<
  ExportedIconName,
  ResolvableIconName
>;

// An icon exported by twenty-ui but absent from ALL_ICONS resolves to the
// default icon at runtime instead of failing, so this parity is checked here.
type AssertNoIconsExportedButNotResolvableByName<T extends never> = T;

export type IconRegistryParity =
  AssertNoIconsExportedButNotResolvableByName<IconsExportedButNotResolvableByName>;
