import { createWebGlContextBudget } from './create-webgl-context-budget';
import { visualTestInstrumentation } from './visual-test-instrumentation';

// Browsers allow 8–16 live WebGL contexts; staying well under leaves room
// for embeds and devtools. A constant, not an env knob — nothing ever
// overrode the old site's variable.
const MAX_ACTIVE_WEBGL_CONTEXTS = 6;

export const webGlContextBudget = createWebGlContextBudget({
  maxActive: MAX_ACTIVE_WEBGL_CONTEXTS,
});

visualTestInstrumentation.registerContextBudget(webGlContextBudget);
