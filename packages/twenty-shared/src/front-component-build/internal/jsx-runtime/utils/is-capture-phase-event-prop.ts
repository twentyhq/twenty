import { CAPTURE_PHASE_PROP_NAME_SUFFIX } from '@/front-component-build/internal/jsx-runtime/constants/capture-phase-prop-name-suffix';

const POINTER_CAPTURE_EVENT_PROP_NAME_SUFFIX = 'PointerCapture';

export const isCapturePhaseEventProp = (eventPropName: string) =>
  eventPropName.endsWith(CAPTURE_PHASE_PROP_NAME_SUFFIX) &&
  !eventPropName.endsWith(POINTER_CAPTURE_EVENT_PROP_NAME_SUFFIX);
