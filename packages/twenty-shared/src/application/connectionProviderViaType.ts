// The third party that brokers the connection on the app's behalf (e.g. Unipile for LinkedIn).
export type ConnectionProviderVia = {
  name: string;
  description?: string;
  logo?: string;
  url?: string;
};
