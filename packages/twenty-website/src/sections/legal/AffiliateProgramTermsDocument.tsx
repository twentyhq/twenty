import { LocalizedLink } from '@/platform/i18n/LocalizedLink';

// Change only together with the "Twenty Affiliate Program Terms" doc.
export function AffiliateProgramTermsDocument() {
  return (
    <>
      <p>
        <strong>Last updated:</strong>
        {' November 3, 2026'}
      </p>

      <h2>1. About these terms</h2>
      <p>
        These terms are an agreement between Twenty.com PBC, a public benefit
        corporation incorporated in Delaware, United States
        (&ldquo;Twenty&rdquo;, &ldquo;we&rdquo;), and you, the person or company
        accepted into the Twenty Affiliate Program (&ldquo;you&rdquo;,
        &ldquo;Partner&rdquo;). You accept them when you tick &ldquo;I agree to
        the affiliate program terms&rdquo; in the application form.
      </p>
      <p>
        In short: you share Twenty, and you earn{' '}
        <strong>20% of the seat revenue</strong> from each new paying customer
        you refer, <strong>for 12 months</strong> from their first payment.
        Commissions are held 30 days, then paid monthly once your balance
        reaches $50.
      </p>
      <p>
        The program covers paid Twenty Cloud subscriptions on the Organization
        and Enterprise plans, bought by customers new to Twenty.
      </p>

      <h2>2. Joining the program</h2>
      <ol>
        <li>
          You apply through the form on{' '}
          <LocalizedLink href="/affiliate-partners">
            twenty.com/affiliate-partners
          </LocalizedLink>
          . You must be at least 18, or a registered business. Twenty employees,
          contractors and members of their household can&rsquo;t join.
        </li>
        <li>
          We review each application, usually within 5 business days. We may
          accept or decline any application, and we don&rsquo;t have to give a
          reason.
        </li>
        <li>Once accepted, you get your partner code and link by email.</li>
        <li>
          Before your first payout, you give us your payout and tax details. No
          payout can be sent until this is done.
        </li>
      </ol>
      <p>
        You may only hold one partner account. Agencies and companies apply
        once; several of your team members can be linked to the same partner
        account.
      </p>

      <h2>3. Your partner code and link</h2>
      <p>
        You get one partner code (for example NORTHWIND) and one link built from
        it: twenty.com/?via=YOURCODE. Both point to the same partner account.
        Your code is set when you&rsquo;re accepted and can&rsquo;t be changed.
      </p>
      <ul>
        <li>
          <strong>The link</strong> saves your code in the visitor&rsquo;s
          browser for 30 days. If they create their Twenty workspace in that
          time, the workspace is attributed to you. Until the workspace is
          created, a click on another partner&rsquo;s link replaces yours: the
          latest click counts. Once the workspace exists, its attribution to you
          is final.
        </li>
        <li>
          <strong>The code</strong> is how a customer who did not come through
          your link is attributed to you, for example a client whose workspace
          you set up. See &ldquo;Code added after sign-up&rdquo; below.
        </li>
      </ul>
      <p>
        Your code is personal. Don&rsquo;t post it on coupon or discount-code
        sites.
      </p>

      <h2>4. Qualified referrals</h2>
      <p>
        A referral qualifies when a customer <strong>new to Twenty</strong>{' '}
        starts a paid subscription attributed to you, and their first payment
        goes through. New to Twenty means they have never paid Twenty before, on
        any workspace.
      </p>
      <p>
        A referral covers that customer&rsquo;s first paid workspace and
        everything that follows for 12 months: plan and seat changes, cancelling
        and coming back, or moving to Enterprise. It never restarts. If the
        customer moves to a new workspace, ask us to add your code on it to keep
        the months left.
      </p>
      <p>How a customer gets attributed to you:</p>
      <ul>
        <li>
          <strong>Through your link:</strong> they created their workspace
          within 30 days of clicking your link.
        </li>
        <li>
          <strong>Code added after sign-up:</strong> if no partner is attributed
          yet, the customer can enter your code on the /settings/partner page of
          their workspace during their free trial. Twenty refuses the code if
          the customer created a Twenty workspace before. Within 30 days of
          their first payment, the customer (or you, on their behalf) can also
          ask us to add it. Either way, you earn from the first invoice. After
          30 days, only Twenty can attach a code, at its discretion; you then
          earn from the next invoice only.
        </li>
      </ul>
      <p>
        One customer, one partner. The first partner code saved on a workspace,
        through a link or entered in billing, is final: only Twenty can change
        it, and a change never starts a new 12 months. If two partners claim the
        same customer, the saved attribution decides. Referrals belong to your
        partner account, not to the person at your company who brought them.
      </p>
      <p>These never qualify:</p>
      <ul>
        <li>Customers who already paid Twenty before, on any workspace.</li>
        <li>
          A new trial or workspace started within 3 months of an earlier trial
          by the same person (same email address). The only exception: that
          earlier trial came through your link, and the new workspace is created
          within 30 days of the click.
        </li>
        <li>
          Your own workspace, or one used by your company, a co-founder or an
          employee (self-referrals). Workspaces you set up and pay for on behalf
          of a client do qualify.
        </li>
        <li>Customers obtained by breaking these terms (section 8).</li>
      </ul>

      <h2>5. Commissions</h2>
      <p>
        You earn <strong>20% of the seat revenue</strong> of each qualified
        customer, on every invoice they pay during the{' '}
        <strong>12 months</strong> after their first payment.
      </p>
      <ul>
        <li>
          <strong>Seat revenue</strong> = what the customer pays for user seats
          on the Organization and Enterprise plans, after discounts and before
          tax. AI credits, usage add-ons, taxes and refunded amounts are not
          included. Seats used by your own team inside a client&rsquo;s
          workspace count like any other seat.
        </li>
        <li>
          <strong>Monthly plans</strong> earn on each monthly invoice.{' '}
          <strong>Yearly plans</strong> earn on the part of the yearly invoice
          that falls inside the 12 months: a switch to yearly in month 5 earns
          on 8 of the 12 months billed.
        </li>
        <li>
          An invoice counts if its billing period starts within the 12 months,
          even if it&rsquo;s paid later. Voided or unpaid invoices earn nothing.
        </li>
        <li>
          Seat changes count, prorated amounts included: if the customer adds
          seats, your commission grows; if they remove seats, it shrinks, never
          below $0 on an invoice and never taken back from past commissions.
        </li>
        <li>
          The 12 months start at the first payment, whatever the number of
          seats. When you set up a workspace for a client, keep it on trial
          until go-live.
        </li>
        <li>
          If a customer cancels, commissions stop with their last paid invoice.
          If they come back within the 12 months, commissions resume until the
          original end date.
        </li>
        <li>
          After 12 months, commissions on that customer stop, even if they stay
          a customer.
        </li>
      </ul>
      <p>
        Example: a customer on the Organization plan with 20 seats pays $1,040 a
        month in seats. You earn $208 a month, up to $2,496 over 12 months.
      </p>
      <p>Commissions are calculated and paid in US dollars.</p>

      <h2>6. Hold, refunds and payouts</h2>
      <ol>
        <li>
          <strong>30-day hold.</strong> Each commission is held for 30 days
          after the customer&rsquo;s payment. This covers refunds and payment
          disputes.
        </li>
        <li>
          <strong>Refund during the hold.</strong> If the payment is fully
          refunded or disputed during the hold, that commission is cancelled. A
          partial refund reduces it in proportion.
        </li>
        <li>
          <strong>After the hold.</strong> The commission becomes payable and is
          yours. We never ask for it back, even if the customer is refunded
          later.
        </li>
        <li>
          <strong>Monthly payout.</strong> On the first business days of each
          month, we pay your payable balance if it is $50 or more. A smaller
          balance rolls over to the next month.
        </li>
        <li>
          <strong>How you&rsquo;re paid.</strong> Payouts are sent from
          Twenty.com PBC (US) to the payout account you give us, through the
          payment provider we use for the program (for example PayPal). Your
          bank or payment provider may charge currency-conversion or
          cross-border fees.
        </li>
      </ol>
      <p>
        A payout can only be sent once your payout and tax details are complete.
        Until then, your balance is kept and we remind you to finish the setup.
        If payouts are still not set up 24 months after your first commission,
        the balance expires. If a transfer fails, we contact you and retry once
        your details are fixed.
      </p>

      <h2>7. Taxes</h2>
      <p>
        You are responsible for declaring and paying the taxes on your
        commissions in your country. Commissions are paid as stated, with no tax
        added or withheld by Twenty unless the law requires it.
      </p>
      <ul>
        <li>
          <strong>US partners</strong> give us a Form W-9 before their first
          payout. If you receive $2,000 or more in a calendar year, a Form
          1099-NEC is filed and sent to you.
        </li>
        <li>
          <strong>Partners outside the US</strong> give us a Form W-8BEN
          (individuals) or W-8BEN-E (companies) before their first payout.
        </li>
        <li>
          If you are VAT-registered, contact us so we can agree how your
          commissions are invoiced.
        </li>
      </ul>

      <h2>8. How you may promote Twenty</h2>
      <p>
        Share Twenty honestly, wherever your audience is: articles, videos,
        newsletters, social posts, communities, client projects.
      </p>
      <p>You must:</p>
      <ul>
        <li>
          Say clearly that you earn a commission when you share your link or
          code (for example &ldquo;affiliate link&rdquo; or &ldquo;#ad&rdquo;),
          as required by the FTC and similar rules in other countries.
        </li>
        <li>
          Describe Twenty accurately: no invented features, prices, discounts or
          claims of partnership beyond being an affiliate.
        </li>
        <li>
          Follow the rules of the platforms you post on, and anti-spam laws when
          you email people.
        </li>
      </ul>
      <p>You must not:</p>
      <ul>
        <li>
          Bid on &ldquo;Twenty&rdquo;, &ldquo;Twenty CRM&rdquo; or close
          variants in paid search ads, or run ads that send people straight to
          twenty.com through your link.
        </li>
        <li>Send unsolicited bulk email or messages, or buy lists.</li>
        <li>
          Set your link&rsquo;s cookie without a real click (cookie stuffing),
          or use bots, pop-ups or fake traffic.
        </li>
        <li>
          Pretend to be Twenty, or offer discounts, refunds or support in
          Twenty&rsquo;s name.
        </li>
        <li>
          Offer customers cashback, gifts or any share of your commission.
        </li>
        <li>
          Create fake accounts, or pay for workspaces no real client uses, to
          earn commissions.
        </li>
        <li>Refer yourself or your own company.</li>
      </ul>

      <h2>9. Use of the Twenty brand</h2>
      <p>
        While you are in the program, you may use the Twenty name, logo and
        product screenshots to promote Twenty, following the guidelines in the
        partner kit. This permission ends when you leave the program.
      </p>
      <p>
        You may not use &ldquo;Twenty&rdquo; in your own company, product or
        domain name, or change the logo. Content you create about Twenty stays
        yours. We&rsquo;ll ask before sharing it on our channels.
      </p>

      <h2>10. Suspension and termination</h2>
      <p>
        <strong>Leaving.</strong> You can leave the program at any time by
        email. Your link and code stop working, so there are no new referrals.
        As long as you haven&rsquo;t broken these terms, you keep earning on the
        customers you already referred until each one&rsquo;s 12 months end, and
        we keep paying you as usual. When the last of them ends, any remaining
        balance is paid, even below $50.
      </p>
      <p>
        <strong>Ending by Twenty.</strong> We can end the program, or your
        participation, with 30 days&rsquo; notice. Unless you broke these terms,
        you keep earning on your existing customers, as above.
      </p>
      <p>
        <strong>Breach.</strong> If you break these terms, we may suspend your
        account straight away while we look into it. During a suspension,
        commissions are still recorded but payouts pause. If the breach is
        confirmed, we close your account: commissions linked to the breach are
        cancelled, other commissions earned in good faith are still paid, and
        you stop earning on new invoices.
      </p>

      <h2>11. General terms</h2>
      <ul>
        <li>
          <strong>Changes.</strong> We may update these terms. We email you at
          least 30 days before a change takes effect. Changes never reduce
          commissions already earned. If you don&rsquo;t agree, you can leave
          the program before the change applies.
        </li>
        <li>
          <strong>Independent partners.</strong> You act on your own behalf.
          Nothing here makes you an employee, agent or legal partner of Twenty,
          and you can&rsquo;t make commitments in our name.
        </li>
        <li>
          <strong>Your data and your customers&rsquo; data.</strong> Each of us
          handles personal data under the privacy laws that apply. We only share
          with you what you need to follow your referrals (workspace name, plan,
          seats and commission amounts), never the content of their workspace.
          Our{' '}
          <LocalizedLink href="/privacy-policy">Privacy Policy</LocalizedLink>{' '}
          explains how we handle yours.
        </li>
        <li>
          <strong>Confidentiality.</strong> Keep any non-public information we
          share with you (roadmaps, pricing plans) confidential.
        </li>
        <li>
          <strong>Transfer.</strong> If your company is acquired or changes
          legal entity, we can transfer your partner account on written request.
        </li>
        <li>
          <strong>Liability.</strong> The program is provided as is. Neither
          party is liable for indirect or consequential losses. Our total
          liability to you is limited to the commissions owed to you under these
          terms.
        </li>
        <li>
          <strong>Governing law.</strong> These terms are governed by the laws
          of the State of Delaware, United States. Disputes go to the state or
          federal courts located in Delaware.
        </li>
        <li>
          <strong>Whole agreement.</strong> These terms, with the brand
          guidelines in the partner kit, are the full agreement between us about
          the program.
        </li>
      </ul>
      <p>
        Questions: <a href="mailto:contact@twenty.com">contact@twenty.com</a>
      </p>
    </>
  );
}
