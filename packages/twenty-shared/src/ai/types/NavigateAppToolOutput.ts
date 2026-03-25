export type NavigateAppToolOutput =
  | {
      action: 'navigateToObject';
      objectNameSingular: string;
    }
  | {
      action: 'navigateToView';
      viewId: string;
      viewName: string;
      objectNameSingular: string;
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
