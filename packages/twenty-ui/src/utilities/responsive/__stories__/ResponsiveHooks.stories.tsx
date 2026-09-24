import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input';
import { Text } from '@ui/primitives/typography';
import { ComponentDecorator } from '@ui/testing';
import { MOBILE_VIEWPORT } from '@ui/theme-constants';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { useIsMobile } from '../hooks/useIsMobile';
import { useIsTouchDevice } from '../hooks/useIsTouchDevice';

const ResponsiveControls = () => {
  const isMobile = useIsMobile();
  const isTouchDevice = useIsTouchDevice();
  const [activations, setActivations] = useState(0);

  return (
    <>
      <Text>Mobile layout: {String(isMobile)}</Text>
      <Text>Touch input: {String(isTouchDevice)}</Text>
      <Button hotkeys={['S']} onClick={() => setActivations(activations + 1)}>
        Save record
      </Button>
      <Button onClick={() => setActivations(activations + 1)}>
        {isTouchDevice ? 'Tap action' : 'Pointer action'}
      </Button>
      <Text>Activations: {activations}</Text>
    </>
  );
};

const meta: Meta<typeof ResponsiveControls> = {
  title: 'UI/Utilities/Responsive Hooks',
  component: ResponsiveControls,
  decorators: [ComponentDecorator],
};

export default meta;

export const NativeQueries: StoryObj<typeof ResponsiveControls> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const isMobile = window.matchMedia(
      `(max-width: ${MOBILE_VIEWPORT}px)`,
    ).matches;
    const isTouchDevice = window.matchMedia(
      '(hover: none) and (pointer: coarse)',
    ).matches;
    await expect(canvas.getByText(`Mobile layout: ${isMobile}`)).toBeVisible();
    await expect(
      canvas.getByText(`Touch input: ${isTouchDevice}`),
    ).toBeVisible();
    const save = canvas.getByRole('button', { name: 'Save record' });
    await expect(isDefined(within(save).queryByText('S'))).toBe(!isMobile);
    await userEvent.click(save);
    await userEvent.click(
      canvas.getByRole('button', {
        name: isTouchDevice ? 'Tap action' : 'Pointer action',
      }),
    );
    await expect(canvas.getByText('Activations: 2')).toBeVisible();
  },
};
