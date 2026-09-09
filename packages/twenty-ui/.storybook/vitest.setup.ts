import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Apply Storybook's preview configuration to Vitest runs.
// The a11y addon annotations register the axe afterEach hook so that
// parameters.a11y.test = 'error' (set in preview.tsx) actually gates tests.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
