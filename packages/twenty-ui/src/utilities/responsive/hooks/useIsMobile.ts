import { MOBILE_VIEWPORT } from '@ui/theme-constants';
import { useMediaQuery } from 'react-responsive';

const mobileMediaQuery = { query: `(max-width: ${MOBILE_VIEWPORT}px)` };

export const useIsMobile = () => useMediaQuery(mobileMediaQuery);
