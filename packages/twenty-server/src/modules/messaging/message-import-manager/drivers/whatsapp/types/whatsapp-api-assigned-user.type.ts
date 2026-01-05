export type WhatsappApiAssignedUser = {
  multiple_accounts?: {
    summary: string;
    value: {
      data: Array<{
        business_id: string;
        phone_numbers: Array<{
          display_phone_number: string;
        }>;
      }>;
      paging?: {
        next?: string;
      };
    };
  };
  single_account?: {
    summary: string;
    value: {
      data: Array<{
        business_id: string;
        phone_numbers: Array<{
          display_phone_number: string;
        }>;
      }>;
    };
  };
  no_accounts: {
    summary: string;
    value: {
      data: [];
    };
  };
};
