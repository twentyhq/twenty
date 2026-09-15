export class CrowdinApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`Crowdin API error: ${status} ${body}`);
  }
}
