export type OAuthConnectionProviderIdentityMethod = 'GET' | 'POST';

export type OAuthConnectionProviderIdentityConfig = {
  endpoint: string;
  method?: OAuthConnectionProviderIdentityMethod;
  body?: string;
  accountIdPath: string;
  labelPath?: string;
};
