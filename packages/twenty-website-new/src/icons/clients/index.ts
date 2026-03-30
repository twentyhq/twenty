import type { ComponentType } from "react";
import { FlexportIcon } from "./Flexport";
import { ZapierIcon } from "./Zapier";

export { FlexportIcon } from "./Flexport";
export { ZapierIcon } from "./Zapier";

export type ClientIconProps = { size: number; fillColor: string };

export const CLIENT_ICONS: Record<string, ComponentType<ClientIconProps>> = {
  flexport: FlexportIcon,
  zapier: ZapierIcon,
};
