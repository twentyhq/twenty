import { TOUCH_DEVICE_MEDIA_QUERY } from '@ui/utilities/responsive/constants/TouchDeviceMediaQuery';
import { useMediaQuery } from '@ui/utilities/responsive/hooks/useMediaQuery';

// Branch on hover capability, not useIsMobile: a narrow desktop window still hovers, a landscape tablet never does.
export const useIsTouchDevice = () => useMediaQuery(TOUCH_DEVICE_MEDIA_QUERY);
