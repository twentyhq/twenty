export type NavigateAppToolOutput =
  | {
      action: 'navigateToDefaultViewForObject';
      objectNameSingular: string;
    }
  | {
      action: 'navigateToIndexPageView';
      viewName: string;
    }
  | {
      action: 'navigateToRecordPage';
      objectNameSingular: string;
      recordId: string;
    }
  | {
      action: 'wait';
      durationMs: number;
    };
