import { type IconComponentProps } from '../src/icon/types/IconComponent';

const ICON_COMPONENT_PROP_NAMES = new Set(
  Object.keys({
    'aria-hidden': true,
    className: true,
    color: true,
    size: true,
    stroke: true,
    style: true,
  } satisfies Record<keyof IconComponentProps, true>),
);

export const isIconComponent = ({
  props,
  supportsSvgAttributes,
}: {
  props: string[];
  supportsSvgAttributes: boolean;
}): boolean =>
  supportsSvgAttributes ||
  props.every((prop) => ICON_COMPONENT_PROP_NAMES.has(prop));
