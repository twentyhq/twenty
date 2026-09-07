import { type ReactElement } from 'react';

import { type IconComponent } from '@ui/icon/types/IconComponent';

import { type AppTooltipProps } from '../AppTooltip';

type IsAssignableToTooltipProps<Props> = Props extends AppTooltipProps
  ? true
  : false;

describe('AppTooltip prop contract', () => {
  it('accepts standard text or custom children separately', () => {
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

  it('rejects mixing custom children with any standard content prop', () => {
    const title: IsAssignableToTooltipProps<{
      title: string;
      children: ReactElement;
    }> = false;
    const description: IsAssignableToTooltipProps<{
      description: string;
      children: ReactElement;
    }> = false;
    const icon: IsAssignableToTooltipProps<{
      Icon: IconComponent;
      children: ReactElement;
    }> = false;

    expect([title, description, icon]).toEqual([false, false, false]);
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
