import { getStripeClient } from '@/shared/enterprise/stripe-client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, returnUrl } = body;

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      return new Response(
        JSON.stringify({ error: 'Invalid email' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const stripe = getStripeClient();
    const existingCustomers = await stripe.customers.list({
      email: normalizedEmail,
      limit: 1,
    });

    const customer =
      existingCustomers.data[0] ??
      (await stripe.customers.create({
        email: normalizedEmail,
        metadata: { source: 'enterprise-self-hosted-portal' },
      }));

    const customerId = customer.id;
    const frontendUrl = process.env.NEXT_PUBLIC_WEBSITE_URL;
    const fullReturnUrl = returnUrl
      ? `${frontendUrl}${returnUrl}`
      : frontendUrl;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: fullReturnUrl,
    });

    return Response.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({
        error: `Portal session error: ${message}`,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
