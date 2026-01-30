type EmailAddress = string | string[];

type MicrosoftRecipient = {
  emailAddress: {
    address: string;
  };
};

export const toMicrosoftRecipients = (
  addresses: EmailAddress | undefined,
): MicrosoftRecipient[] => {
  if (!addresses) return [];

  const addressArray = Array.isArray(addresses) ? addresses : [addresses];

  return addressArray.map((address) => ({
    emailAddress: { address },
  }));
};
