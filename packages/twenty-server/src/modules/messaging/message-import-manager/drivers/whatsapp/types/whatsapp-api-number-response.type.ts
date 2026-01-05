export type WhatsappApiNumberResponse = {
  multiple_users?: {
    summary: string;
    value: {
      data: Array<{
        id: string;
        name: string;
        business: {
          id: string;
        };
      }>;
      paging?: {
        cursors: {
          after: string;
          before: string;
        };
        next?: string;
      };
    };
  };
  single_user?: {
    summary: string;
    value: {
      data: {
        id: string;
        name: string;
        business: {
          id: string;
        };
      };
    };
  };
};
