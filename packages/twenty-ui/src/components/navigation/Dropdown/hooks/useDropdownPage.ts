import { useDropdownContext } from '../internal/useDropdownContext';

export const useDropdownPage = () => {
  const { pageId, goToPage, goBack, canGoBack } = useDropdownContext();

  return {
    page: pageId,
    goToPage: (page: string) => goToPage({ id: page }),
    goBack,
    canGoBack,
  };
};
