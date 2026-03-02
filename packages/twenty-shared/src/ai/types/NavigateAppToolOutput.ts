export type NavigateAppToolOutput =
  | {
      action: 'navigateToObject';
      objectNameSingular: string;
    }
  | {
      action: 'navigateToView';
      viewName: string;
    }
  | {
      action: 'navigateToRecord';
      objectNameSingular: string;
      recordId: string;
    }
  | {
      action: 'wait';
      durationMs: number;
    };
