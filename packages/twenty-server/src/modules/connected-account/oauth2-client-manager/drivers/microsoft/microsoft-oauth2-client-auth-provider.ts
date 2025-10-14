import type { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

export class MicrosoftOAuth2ClientAuthProvider
  implements AuthenticationProvider
{
  constructor(private readonly accessToken: string) {}

  public async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}
