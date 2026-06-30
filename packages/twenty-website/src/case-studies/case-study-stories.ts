import { msg } from '@lingui/core/macro';

import { type CaseStudyStory } from './case-study-types';

// The detail content for each /customers/<slug>, keyed by the catalog slug. The
// catalog entry supplies the shared hero data (industry, kpis, quote, author,
// cover image); this adds the meta, the accented hero title, the prose, and the
// curated table-of-contents labels (which differ from the section headings).
export const CASE_STUDY_STORIES: Record<string, CaseStudyStory> = {
  '9dots': {
    meta: {
      title: msg`Homeseller, WhatsApp, and a CRM built around the business | Nine Dots & Twenty`,
      description: msg`How Nine Dots Ventures rebuilt a Singapore real estate agency on Twenty with APIs, n8n, Grafana, and AI on top of 2,000+ WhatsApp messages a day.`,
    },
    heroTitle: msg`A real estate agency on WhatsApp built a\n*CRM* around it`,
    sections: [
      {
        eyebrow: msg`Homeseller`,
        heading: msg`When the channel is *the business*`,
        paragraphs: [
          msg`Homeseller is a high-volume real estate agency in Singapore, founded by one of the country's top-performing property agents. The whole operation runs on WhatsApp: no email, no calendars, just group chats, thousands of them, with clients, agents, and leads together.`,
          msg`That works until you need to understand the business underneath. Which deals are stuck? Where are leads coming from? What is the close rate? With spreadsheets and a legacy custom CRM that could not keep up, those questions were nearly impossible to answer.`,
          msg`Mike and Azmat from Nine Dots stepped in to fix that, not by changing how Homeseller works, but by building a system that finally fit around it.`,
        ],
        callout: {
          text: msg`Twenty lets us build a CRM around the business and not the business around the CRM.`,
          author: 'Mike Babiy',
          role: msg`Founder, Nine Dots Ventures`,
        },
      },
      {
        eyebrow: msg`Architecture`,
        heading: msg`The CRM as a *control hub*`,
        paragraphs: [
          msg`Nine Dots rebuilt Homeseller's operations on Twenty, with a custom data model shaped around their sales flow. Because Twenty is open and everything is accessible via API, they connected it to what the business actually needed: n8n for automated workflows (in-app workflows were not available at that time), Grafana for live dashboards fed from Twenty, and a custom AI layer to parse and extract structured insights from more than 2,000 WhatsApp messages a day.`,
          msg`Homeseller kept their habits. WhatsApp stayed WhatsApp. What changed is that everything flowing through those conversations now lands in a structured system, tracked, classified, and visible in real time.`,
        ],
        callout: {
          text: msg`Twenty is the heart of the system. Everything branches from it.`,
          author: 'Azmat Parveen',
          role: msg`Nine Dots Ventures`,
        },
      },
      {
        eyebrow: msg`The result`,
        heading: msg`*150 hours* saved every month`,
        paragraphs: [
          msg`About 150 hours per month saved in manual operations. Real-time metrics for the business owner. Growth readiness without adding operational headcount. A team that can answer questions that used to take days to piece together.`,
          msg`The full rollout landed in July 2025. Since then, Nine Dots built a Smart Assistant on top of the system, nudging agents with tasks, reminders, and on-demand market analysis. Some agents never open Twenty directly, yet they are powered by it, outperforming peers on manual processes alone. By Q1 2026, Homeseller had recorded its best sales quarter ever.`,
        ],
      },
    ],
    tableOfContents: [
      msg`When the channel is the business`,
      msg`The CRM as a control hub`,
      msg`The result`,
    ],
  },
  'alternative-partners': {
    meta: {
      title: msg`From Salesforce to self-hosted Twenty, powered by AI | Alternative Partners`,
      description: msg`How Alternative Partners migrated from Salesforce to self-hosted Twenty using agentic AI in the implementation loop: fast migration, durable ownership.`,
    },
    heroTitle: msg`From Salesforce to\n*self-hosted Twenty*`,
    sections: [
      {
        eyebrow: msg`Alternative Partners`,
        heading: msg`AI in the *migration workflow*`,
        paragraphs: [
          msg`Alternative Partners is a consulting firm that moved from Salesforce to a self-hosted Twenty instance. Benjamin Reynolds led the migration. He had already become a Twenty expert implementing Twenty for one of Twenty's first cloud customers.`,
          msg`His approach was unconventional. Instead of mapping fields manually, scripting transforms, and validating data step by step, he handed the job to agentic AI tools with a brief: where the data lives, the GitHub repo for the target platform, and the Railway deployment. Start, and only return if something breaks beyond a 70% confidence fix.`,
          msg`It worked. This is AI-assisted iteration in practice: not AI as a product feature, but as part of implementation work, compressing what would typically be weeks into something one person can oversee without being the bottleneck.`,
        ],
      },
      {
        eyebrow: msg`Ownership`,
        heading: msg`Self-hosted *means control*`,
        paragraphs: [
          msg`The self-hosted setup means Alternative Partners owns the full stack: no vendor access to their data, no dependency on a SaaS pricing model, full control over how the system evolves. The migration was fast because of AI; the result is durable because the stack is open source.`,
        ],
      },
    ],
    tableOfContents: [
      msg`AI in the migration workflow`,
      msg`Self-hosted means control`,
    ],
  },
  netzero: {
    meta: {
      title: msg`A CRM that grows with you | NetZero & Twenty`,
      description: msg`How NetZero uses Twenty across carbon credits, agricultural products, and franchised industrial systems with a modular CRM and a roadmap toward AI-assisted workflows.`,
    },
    heroTitle: msg`A CRM that\n*grows* with you`,
    sections: [
      {
        eyebrow: msg`NetZero`,
        heading: msg`The right *foundation*`,
        paragraphs: [
          msg`NetZero works with the agro-industry, serving clients from multinationals to smallholder farmers. They sell carbon credits, agricultural products, and franchised industrial systems across three different product lines, multiple countries, and multiple company sizes. When Olivier Reinaud, co-founder of NetZero, started looking at CRMs in late 2024, he was not chasing the most feature-rich platform. He wanted the right foundation.`,
        ],
        callout: {
          text: msg`Twenty delivers on what CRMs should have always been: fairly priced software with a fully modular and customizable model, a clean and modern UI, granular permissions, automations, enterprise features. A compelling solution with high potential to rightfully disrupt the CRM market.`,
          author: 'Olivier Reinaud',
          role: msg`co-founder of NetZero`,
        },
      },
      {
        eyebrow: msg`Flexibility`,
        heading: msg`A business that does not fit a *template*`,
        paragraphs: [
          msg`What convinced Olivier was the flexibility of the platform and where it was headed. Even when initial needs were basic record-keeping, he still needed a custom data model with granular permissions to manage the wide range of NetZero activities. He also needed a system that could adapt quickly to a fast-iteration company.`,
          msg`With Twenty, when a new need appears, he can address it himself: no developer required, no support ticket.`,
        ],
        callout: {
          text: msg`The flexibility is really what made the difference. Our needs evolve very fast. I discover a new need and in two clicks I can address it. That is a real advantage when you are moving quickly.`,
          author: 'Olivier Reinaud',
          role: msg`co-founder of NetZero`,
        },
      },
      {
        eyebrow: msg`Roadmap`,
        heading: msg`From simple to *advanced*`,
        paragraphs: [
          msg`Olivier recognizes that NetZero's current use of Twenty is still relatively simple: workflows and integrations are not yet as deep as he eventually wants, because he prioritized getting foundations right first.`,
          msg`What is planned is significant. NetZero has a data lake, online forms, and multiple internal systems that he wants to connect to Twenty. The pipes are there; the next step is automations that tie them together.`,
          msg`What is coming in April 2026 is what he has been waiting for: AI-assisted workflow creation, describing what he needs and iterating from there instead of building complex logic from scratch. For a founder who runs the CRM himself, that changes what is realistically possible.`,
        ],
      },
      {
        eyebrow: msg`Results`,
        heading: msg`The bet is *paying off*`,
        paragraphs: [
          msg`While NetZero still runs a second CRM in parallel for WhatsApp-heavy operations with farmers in Brazil, they expect to migrate all of it to Twenty as features and the ecosystem grow. Already, their structured, multinational pipeline is powered by Twenty.`,
          msg`The early bet on the architecture is holding, and upcoming AI features are expected to make it even more relevant.`,
        ],
      },
    ],
    tableOfContents: [
      msg`The right foundation`,
      msg`A business that does not fit a template`,
      msg`From simple to advanced`,
      msg`The bet is paying off`,
    ],
  },
  'act-education': {
    meta: {
      title: msg`Burned by vendor lock-in, AC&T built a CRM they actually own | Twenty`,
      description: msg`How AC&T Education Migration and Flycoder replaced a shuttered vendor CRM with self-hosted Twenty, with 90%+ lower cost and full ownership.`,
    },
    heroTitle: msg`A CRM they\n*actually own*`,
    sections: [
      {
        eyebrow: msg`AC&T Education Migration`,
        heading: msg`When the vendor *pulled the plug*`,
        paragraphs: [
          msg`AC&T Education Migration (actimmi.com) is an education agency in Australia. They help international students with applications to education providers and visas. They had been on a previous CRM until the vendor shut the system down, leaving nothing but a CSV export.`,
          msg`Whatever came next had to be something they could own.`,
        ],
        callout: {
          text: msg`They did not want to learn someone else's system. They wanted to keep working the way they already did and make it smoother.`,
          author: 'Joseph Chiang',
          role: msg`CRM Engineer, AC&T Education Migration`,
        },
      },
      {
        eyebrow: msg`Implementation`,
        heading: msg`No more renting someone else's *structure*`,
        paragraphs: [
          msg`They evaluated Salesforce, Zoho, Pipedrive, and SuiteCRM. Each came with the same tradeoffs: too expensive, too rigid, or too generic, and none fixed the underlying problem. They were still renting a structure they did not control.`,
          msg`Flycoder, a full-stack development partner, helped them set up Twenty as a self-hosted instance shaped around how AC&T actually operates. The data model centers on students, not a generic contact-and-deal pipeline. Statuses update automatically: a workflow runs nightly to keep enrollment records current. Automated email reminders cover important dates. Adding a new record takes under a minute.`,
          msg`The result is a system that fits how AC&T already worked, instead of the other way around.`,
        ],
      },
      {
        eyebrow: msg`Control`,
        heading: msg`Control without *the overhead*`,
        paragraphs: [
          msg`Self-hosted means AC&T carries no vendor risk: no pricing model that can change, no platform that can disappear, no forced migration. The system is theirs.`,
          msg`Because everything is built on Twenty's open foundation, Flycoder could wire the exact logic AC&T needed without fighting the platform.`,
        ],
      },
      {
        eyebrow: msg`The result`,
        heading: msg`Costs down more than *90%*`,
        paragraphs: [
          msg`CRM costs dropped by more than 90%. Manual overhead tied to the old system is gone. For the first time, AC&T has a CRM they will not lose again.`,
          msg`They did not just replace a tool. They took back ownership of how their business runs.`,
        ],
      },
    ],
    tableOfContents: [
      msg`When the vendor pulled the plug`,
      msg`No more renting someone else's structure`,
      msg`Control without the overhead`,
      msg`The result`,
    ],
  },
  w3villa: {
    meta: {
      title: msg`When your CRM is the product: W3Grads on Twenty | W3villa Technologies`,
      description: msg`How W3villa Technologies shipped W3Grads, an AI mock interview platform for institutions, on Twenty as the operational backbone.`,
    },
    heroTitle: msg`When your CRM is\n*the product*`,
    sections: [
      {
        eyebrow: msg`W3Grads`,
        heading: msg`Scale without *breaking operations*`,
        paragraphs: [
          msg`Running mock interview programs for hundreds of students sounds straightforward. In practice, universities and training institutes hit the same wall: registrations entered by hand, interview links sent one by one, faculty reviewing every session without scoring or classification. At real scale, it breaks.`,
          msg`W3villa Technologies set out to solve it properly, not with a workaround, but with a product.`,
        ],
        callout: {
          text: msg`We did not want to patch over the problem. We wanted to build something institutions could rely on at scale, and that meant starting from a foundation solid enough to support the full complexity of what we had in mind.`,
          author: 'Amrendra Pratap Singh',
          role: msg`VP of Engineering, W3villa Technologies`,
        },
      },
      {
        eyebrow: msg`Architecture`,
        heading: msg`Focus on the use case, not the *plumbing*`,
        paragraphs: [
          msg`W3villa built W3Grads (w3grads.com), an AI-powered mock interview platform for universities and training institutes, using Twenty as its operational backbone.`,
          msg`The key decision was not to build everything from scratch. Twenty covers the data model, permissions, authentication, and workflow engine, the parts that would have taken months to rebuild, so the team could focus on product-specific logic.`,
          msg`When a student registers via QR at a campus event, the system assigns a plan, generates an interview session, and sends a link. The AI conducts the interview, scores the candidate, and classifies the result. Faculty see where each student stands without manually reviewing every session. Building and iterating on these workflows was faster with AI in the loop.`,
        ],
      },
      {
        eyebrow: msg`Scale`,
        heading: msg`A platform ready to *grow*`,
        paragraphs: [
          msg`Because the foundation is solid, W3Grads is architected for what comes next, including a payment layer for future paid interview plans and nationwide scale without structural rewrites.`,
        ],
        callout: {
          text: msg`Twenty gave us the flexibility to model the entire interview lifecycle as custom objects and workflows. We could build something genuinely complex without fighting the platform to do it.`,
          author: 'Piyush Khandelwal',
          role: msg`Director, W3villa Technologies, Partner`,
        },
      },
      {
        eyebrow: msg`The result`,
        heading: msg`*Zero manual work* at the core`,
        paragraphs: [
          msg`Programs that previously needed heavy manual coordination now run end-to-end with automation. Institutions get a scalable, intelligent system; students get faster preparation for interviews that matter; W3villa shipped a product institutions can build revenue around.`,
          msg`Zero manual work at the core. Full automation. Built on Twenty.`,
        ],
      },
    ],
    tableOfContents: [
      msg`Scale without breaking operations`,
      msg`Focus on the use case, not the plumbing`,
      msg`A platform ready to grow`,
      msg`The result`,
    ],
  },
  'elevate-consulting': {
    meta: {
      title: msg`Twenty as the API backbone of a go-to-market stack | Elevate Consulting`,
      description: msg`How Elevate Consulting moved off documents and spreadsheets to Twenty as the API-connected CRM at the center of their stack.`,
    },
    heroTitle: msg`Twenty as the\n*API backbone* of a go-to-market stack`,
    sections: [
      {
        eyebrow: msg`The situation`,
        heading: msg`From documents to *open APIs*`,
        paragraphs: [
          msg`Elevate Consulting is a management consultancy based in Canada. When Justin Beadle, Director of Digital and Information, joined, the company ran entirely on Word documents, Excel spreadsheets, sticky notes, emails, and reliance on people. There was no CRM, no API-accessible tools, only a patchwork trying to stand in for a single source of truth.`,
          msg`The CEO had resisted bringing in a CRM for years. The business development team had no experience using one, and the licensing costs of well-known CRMs like Salesforce or HubSpot were hard to justify without any guarantee of adoption: CRMs are only as good as the maintenance of the data inside them.`,
          msg`In June 2025, Justin learned Twenty v1 had shipped. Within two or three days, the CEO asked him to look into setting up a CRM. The shift came from the potential of what could be built on top of fully open APIs. The timing was perfect.`,
        ],
        callout: {
          text: msg`It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other. Twenty made that possible in a way older CRM platforms simply do not.`,
          author: 'Justin Beadle',
          role: msg`Director of Digital and Information, Elevate Consulting`,
        },
      },
      {
        eyebrow: msg`Integration`,
        heading: msg`One *API* to rule them all`,
        paragraphs: [
          msg`Justin's broader mission at Elevate has been to move the company off static documents and onto tools with API access. By the end of 2025, that was in place: time billing, resource planning, Microsoft Teams, and project management were all accessible via API, with Twenty at the center holding client and opportunity data. Team members could use that information strategically instead of re-keying it.`,
          msg`That opened the door to something more powerful. Justin built a custom front end that pulls live data from those systems into a single view, tailored to each role. When a proposal is won, what used to require four separate people manually setting up instances across four different tools now happens in a single click, drawing on data collected in Twenty across the full opportunity lifecycle. It is another shift toward higher-value work for clients.`,
          msg`Twenty is not only where CRM data lives. It is the API backbone that makes the rest of the stack possible.`,
        ],
        callout: {
          text: msg`Because Twenty's API is fully open, I could connect it to every other tool in our stack. When a proposal is won, what used to take four people manually setting things up across four different tools now happens in a single click. That is the kind of time saving that only becomes possible when everything is connected.`,
          author: 'Justin Beadle',
          role: msg`Director of Digital and Information, Elevate Consulting`,
        },
      },
      {
        eyebrow: msg`Adoption`,
        heading: msg`Workflows that *actually get used*`,
        paragraphs: [
          msg`The business development team finally had the CRM they had been asking for. Adoption came naturally: their data was already there when they logged in.`,
          msg`Justin built workflows for notifications across the team, alerting the right people in Teams when a prospect becomes a lead or when project milestones are reached. Forms in Twenty let the business development team log activity without leaving the tool. The impact is real for the organization. The tool has been adaptable from opportunity-level work at a client to executive-level decisions.`,
          msg`The flexibility to wire this together, without outside help and without fighting the platform, is what made it possible for a single person to stand up and maintain a connected stack across an entire consultancy.`,
        ],
      },
      {
        eyebrow: msg`What is next`,
        heading: msg`Beyond *internal rollout*`,
        paragraphs: [
          msg`Elevate's CEO was so impressed with Twenty he started recommending it to clients before the internal setup was even complete. The team is exploring bringing Twenty to client projects as part of their consulting practice, including as the backend for custom-built products tailored to specific operational needs.`,
          msg`For a firm that once ran on sticky notes, this is more than an upgrade. It is a complete transformation.`,
        ],
      },
    ],
    tableOfContents: [
      msg`From documents to open APIs`,
      msg`One API to rule them all`,
      msg`Workflows that actually get used`,
      msg`What is next`,
    ],
  },
};
