import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input';
import { Text } from '@ui/primitives/typography';
import { ComponentDecorator, overrideMediaQueryMatches } from '@ui/testing';
import { MOBILE_MEDIA_QUERY } from '../constants/MobileMediaQuery';
import { TOUCH_DEVICE_MEDIA_QUERY } from '../constants/TouchDeviceMediaQuery';
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
  beforeEach: ({ parameters }) =>
    overrideMediaQueryMatches({
      [MOBILE_MEDIA_QUERY]: parameters.isMobile === true,
      [TOUCH_DEVICE_MEDIA_QUERY]: parameters.isTouchDevice === true,
    }),
};

export default meta;

type Story = StoryObj<typeof ResponsiveControls>;

export const DesktopPointer: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Mobile layout: false')).toBeVisible();
    await expect(canvas.getByText('Touch input: false')).toBeVisible();
    const save = canvas.getByRole('button', { name: 'Save record' });
    await expect(within(save).getByText('S')).toBeVisible();
    await userEvent.click(save);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Pointer action' }),
    );
    await expect(canvas.getByText('Activations: 2')).toBeVisible();
  },
};

export const MobileTouch: Story = {
  parameters: { isMobile: true, isTouchDevice: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Mobile layout: true')).toBeVisible();
    await expect(canvas.getByText('Touch input: true')).toBeVisible();
    const save = canvas.getByRole('button', { name: 'Save record' });
    await expect(within(save).queryByText('S')).not.toBeInTheDocument();
    await userEvent.click(save);
    await userEvent.click(canvas.getByRole('button', { name: 'Tap action' }));
    await expect(canvas.getByText('Activations: 2')).toBeVisible();
  },
};
