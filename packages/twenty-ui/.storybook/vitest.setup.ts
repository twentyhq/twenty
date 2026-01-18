import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Apply Storybook's preview configuration to Vitest runs.
setProjectAnnotations([projectAnnotations]);
