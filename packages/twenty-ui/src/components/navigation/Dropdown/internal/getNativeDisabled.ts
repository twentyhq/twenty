import { isBoolean } from '@sniptt/guards';

export const getNativeDisabled = ({
  nativeButton,
  renderProps,
}: {
  nativeButton: boolean;
  renderProps: object;
}) =>
  nativeButton && 'disabled' in renderProps && isBoolean(renderProps.disabled)
    ? renderProps.disabled
    : undefined;
