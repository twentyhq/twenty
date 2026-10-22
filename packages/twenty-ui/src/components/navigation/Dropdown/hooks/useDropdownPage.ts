import { useDropdownContext } from '../internal/useDropdownContext';

export const useDropdownPage = () => {
  const { pageId, isPageActive, open, goToPage, goBack, canGoBack } =
    useDropdownContext();

  return {
    page: pageId,
    isActive: isPageActive && open,
    goToPage: (page: string) => goToPage({ id: page }),
    goBack,
    canGoBack,
  };
};
