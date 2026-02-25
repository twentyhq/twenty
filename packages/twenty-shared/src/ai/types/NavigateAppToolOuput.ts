export type NavigateAppToolOutput =
  | {
      action: 'navigateToDefaultViewForObject';
      objectNameSingular: string;
    }
  | {
      action: 'navigateToIndexPageView';
      viewName: string;
    };
