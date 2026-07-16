import { createHmac } from 'crypto';

export function signPayload(args: {
  payload: Record<string, unknown>;
  secret: string;
  timestamp?: string;
}): string {
  const timestamp = args.timestamp ?? Date.now().toString();
  const hex = createHmac('sha256', args.secret)
    .update(`${timestamp}:${JSON.stringify(args.payload)}`)
    .digest('hex');

  return `t=${timestamp},v1=${hex}`;
}
