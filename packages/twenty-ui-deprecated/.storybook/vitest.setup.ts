import { setProjectAnnotations } from '@storybook/react-vite';
import { MotionGlobalConfig } from 'framer-motion';
import * as projectAnnotations from './preview';

// Freeze framer-motion so Argos screenshots are deterministic. Playwright's
// `animations: "disabled"` only halts CSS animations/transitions, not
// framer-motion's main-thread (rAF) animations, so loaders/spinners were
// captured mid-frame and flagged as visual changes on every run.
MotionGlobalConfig.skipAnimations = true;

// Apply Storybook's preview configuration to Vitest runs.
setProjectAnnotations([projectAnnotations]);
