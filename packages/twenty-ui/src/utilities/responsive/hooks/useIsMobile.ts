import { MOBILE_MEDIA_QUERY } from '@ui/utilities/responsive/constants/MobileMediaQuery';
import { useMediaQuery } from '@ui/utilities/responsive/hooks/useMediaQuery';

export const useIsMobile = () => useMediaQuery(MOBILE_MEDIA_QUERY);
