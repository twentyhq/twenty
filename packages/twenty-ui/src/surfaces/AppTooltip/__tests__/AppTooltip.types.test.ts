import { type ReactElement } from 'react';

import { type IconComponent } from '@ui/icon/types/IconComponent';

import { type AppTooltipProps } from '../AppTooltip';

type IsAssignableToTooltipProps<Props> = Props extends AppTooltipProps
  ? true
  : false;

describe('AppTooltip prop contract', () => {
  it('accepts standard text or custom children on their own', () => {
    const title: IsAssignableToTooltipProps<{ title: string }> = true;
    const description: IsAssignableToTooltipProps<{ description: string }> =
      true;
    const standard: IsAssignableToTooltipProps<{
      title: string;
      Icon: IconComponent;
      description: string;
    }> = true;
    const custom: IsAssignableToTooltipProps<{ children: ReactElement }> = true;

    expect([title, description, standard, custom]).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });

  it('accepts custom children alongside standard content props', () => {
    const title: IsAssignableToTooltipProps<{
      title: string;
      children: ReactElement;
    }> = true;
    const description: IsAssignableToTooltipProps<{
      description: string;
      children: ReactElement;
    }> = true;
    const icon: IsAssignableToTooltipProps<{
      Icon: IconComponent;
      children: ReactElement;
    }> = true;
    const combined: IsAssignableToTooltipProps<{
      title: string;
      description: string;
      Icon: IconComponent;
      children: ReactElement;
    }> = true;

    expect([title, description, icon, combined]).toEqual([
      true,
      true,
      true,
      true,
    ]);
  });

  it('only exposes the new prop names', () => {
    const removedKeys: Extract<
      keyof AppTooltipProps,
      'content' | 'width' | 'clickable'
    > extends never
      ? true
      : false = true;
    const maxWidth: IsAssignableToTooltipProps<{ maxWidth: string }> = true;
    const interactive: IsAssignableToTooltipProps<{ interactive: boolean }> =
      true;

    expect([removedKeys, maxWidth, interactive]).toEqual([true, true, true]);
  });
});
