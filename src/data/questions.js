// Each question has four answers scored 0-3. Keep the wording concrete: people
// answer honestly when they can picture the situation.

export const DIMENSIONS = [
  {
    id: "strategy",
    name: "Use cases & sponsorship",
    blurb: "Do you know what you want agents to do, and who owns the outcome?",
    questions: [
      {
        id: "s1",
        text: "How clearly have you identified work an agent could take on?",
        options: [
          "We haven't looked yet",
          "We have a long list of ideas, nothing prioritised",
          "We have two or three candidate workflows with rough benefits",
          "We have a ranked shortlist with baseline numbers (time, volume, error rate)",
        ],
      },
      {
        id: "s2",
        text: "Who is sponsoring agent work?",
        options: [
          "Nobody in particular",
          "Interested individuals or an innovation team",
          "A business leader for one workflow",
          "An executive with budget and a business owner per workflow",
        ],
      },
      {
        id: "s3",
        text: "How will you judge whether an agent is working?",
        options: [
          "We'd know it when we see it",
          "User feedback after launch",
          "A few target metrics, not yet measured today",
          "Agreed success metrics with today's baseline and an accuracy target",
        ],
      },
    ],
    advice: [
      "Pick one workflow that is repetitive, rule-based and spread across several tools. Measure how long it takes today before you build anything.",
      "Rank your ideas by value and feasibility and agree a single business owner for the first one.",
      "Write down the success metric and an accuracy target for your first workflow, and collect 50-100 real examples to test against.",
      "You're in good shape. Keep a backlog of the next workflows and reuse the business-case template.",
    ],
  },
  {
    id: "data",
    name: "Data & knowledge",
    blurb: "Can an agent find the information it needs, and is that information right?",
    questions: [
      {
        id: "d1",
        text: "Where does the knowledge for your target workflows live?",
        options: [
          "Mostly in people's heads and inboxes",
          "Scattered files and shared drives",
          "Mostly in a few known systems (wiki, SharePoint, ticketing)",
          "In owned, structured sources with clear owners",
        ],
      },
      {
        id: "d2",
        text: "How current and trustworthy is that content?",
        options: [
          "Nobody knows what's current",
          "Often out of date or contradictory",
          "Mostly current, with some gaps",
          "Reviewed on a schedule, with owners and version history",
        ],
      },
      {
        id: "d3",
        text: "Do you have real examples of the work (questions, cases, documents) to test an agent with?",
        options: [
          "No",
          "We could dig some up",
          "Yes, but they'd need cleaning and labelling",
          "Yes, with known correct outcomes",
        ],
      },
    ],
    advice: [
      "Start with a workflow whose knowledge already sits in one system. Agents can't fix knowledge nobody wrote down.",
      "Pick the two or three sources your first agent will rely on and give each an owner who keeps it current.",
      "Turn your examples into a small golden dataset: real inputs and the outcome a good employee would reach.",
      "Your data is a strength. Make sure access rules travel with it when you index it.",
    ],
  },
  {
    id: "tools",
    name: "Systems & APIs",
    blurb: "Can an agent safely read from and act in the systems where the work happens?",
    questions: [
      {
        id: "t1",
        text: "Do the systems in your target workflow have APIs?",
        options: [
          "No, or we don't know",
          "Some do, mostly undocumented",
          "Most do, with documentation",
          "Yes, and we already expose some of them as MCP servers or internal tools",
        ],
      },
      {
        id: "t2",
        text: "Can you create scoped service accounts for an agent?",
        options: [
          "Only by sharing a person's login",
          "Possible, but slow and broad",
          "Yes, with reasonable scoping",
          "Yes, least-privilege per workflow, with secrets in a vault",
        ],
      },
      {
        id: "t3",
        text: "Where would people use the agent?",
        options: [
          "Not decided",
          "A separate new app",
          "Inside a tool they already use (Teams, Slack, the ticketing system)",
          "Inside existing tools, with an approval step where it matters",
        ],
      },
    ],
    advice: [
      "List the systems your first workflow touches and check which have APIs. Start read-only.",
      "Get a dedicated, scoped service identity for the agent. Never let an agent act with a person's credentials.",
      "Wrap the two or three APIs you need as tools (MCP servers work well) and meet users in the chat tool they already use.",
      "Your integration layer is ready. Add policy checks before every write action.",
    ],
  },
  {
    id: "governance",
    name: "Governance & risk",
    blurb: "Would your security, legal and audit teams say yes?",
    questions: [
      {
        id: "g1",
        text: "Do you have a policy for using generative AI at work?",
        options: [
          "No",
          "Informal guidance",
          "A written policy",
          "A written policy plus a review process for new AI use cases",
        ],
      },
      {
        id: "g2",
        text: "How would you control what an agent is allowed to do?",
        options: [
          "We haven't thought about it",
          "We'd trust the prompt",
          "Restricted permissions and human sign-off on actions",
          "Policy-as-code checks before each action, approvals where needed, everything logged",
        ],
      },
      {
        id: "g3",
        text: "Are there data-residency or regulatory constraints on where models run?",
        options: [
          "We don't know",
          "Probably, not yet checked",
          "Yes, and we know what they are",
          "Yes, and we have approved model endpoints that meet them",
        ],
      },
    ],
    advice: [
      "Bring security and legal in now with a one-page AI use policy. It is much harder to retrofit later.",
      "Decide which actions need a person to approve them, and log every prompt and tool call from day one.",
      "Agree approved model endpoints (region, private networking, no-training terms) so each project doesn't relitigate them.",
      "Strong governance. Make sure it's automated in the platform, not a manual checklist per project.",
    ],
  },
  {
    id: "platform",
    name: "Platform & operations",
    blurb: "Can you run agents reliably, measure them and control what they cost?",
    questions: [
      {
        id: "p1",
        text: "Where would agents run?",
        options: [
          "Not decided",
          "On a vendor's SaaS platform",
          "In our cloud, case by case",
          "On a standard platform in our cloud (containers, gateway, secrets, networking)",
        ],
      },
      {
        id: "p2",
        text: "How would you know an agent got worse after a change?",
        options: [
          "Users would complain",
          "Manual spot checks",
          "Some automated tests",
          "Automated evaluations on a golden dataset for every change",
        ],
      },
      {
        id: "p3",
        text: "How would you track model and token costs?",
        options: [
          "From the monthly invoice",
          "Per project, roughly",
          "Per application dashboards",
          "Budgets per workflow, with alerts",
        ],
      },
    ],
    advice: [
      "Decide where agents will run before the first build. Your own cloud tenancy is usually the easiest route through security review.",
      "Set up tracing and a basic evaluation run from the first prototype, not after launch.",
      "Put a model gateway in front of all LLM calls so you get cost per workflow and can switch models without code changes.",
      "Your platform is ready for more than one agent. Standardise it as a template teams can reuse.",
    ],
  },
  {
    id: "people",
    name: "People & skills",
    blurb: "Do you have the people to build, own and adopt agents?",
    questions: [
      {
        id: "e1",
        text: "Who would build the agents?",
        options: [
          "No one identified",
          "A few enthusiasts, part time",
          "A team with software skills, new to LLMs",
          "Engineers who have shipped LLM features to production",
        ],
      },
      {
        id: "e2",
        text: "Who owns an agent after it goes live?",
        options: [
          "Not discussed",
          "The team that built it, informally",
          "A named owner, but no support process",
          "A named owner with support, monitoring and a change process",
        ],
      },
      {
        id: "e3",
        text: "How do the people doing the work today feel about it?",
        options: [
          "Haven't been asked",
          "Worried or sceptical",
          "Open to it",
          "Asking for it, and willing to help test",
        ],
      },
    ],
    advice: [
      "Find one engineer and one business user who will spend real time on the first workflow. Don't start without both.",
      "Involve the people who do the work today from the start. They know the edge cases and they'll decide whether it gets used.",
      "Name an owner for each agent in production, with the same support expectations as any other system.",
      "Good foundations. Consider a small internal guild so lessons from the first agent reach the next team.",
    ],
  },
];

export const INDUSTRIES = [
  "Banking & insurance",
  "Distribution & logistics",
  "Education",
  "Healthcare & life sciences",
  "Manufacturing",
  "Media & entertainment",
  "Professional services",
  "Public sector",
  "Retail & e-commerce",
  "Semiconductors & high-tech",
  "Software & SaaS",
  "Telecom",
  "Other",
];

export const FUNCTIONS = [
  { id: "it", name: "IT operations" },
  { id: "eng", name: "Engineering & product" },
  { id: "support", name: "Customer support" },
  { id: "finance", name: "Finance" },
  { id: "hr", name: "HR & recruiting" },
  { id: "sales", name: "Sales & marketing" },
  { id: "legal", name: "Legal & compliance" },
  { id: "ops", name: "Operations & supply chain" },
];

export const LEVELS = [
  { min: 0, name: "Exploring", text: "The basics an agent depends on aren't in place yet. That's normal. Fix the two weakest areas before building anything." },
  { min: 25, name: "Experimenting", text: "You can run a useful proof of concept on a narrow workflow. Expect to spend most of the effort on data, access and governance rather than the model." },
  { min: 50, name: "Ready to pilot", text: "You can take a well-chosen workflow to a production pilot with real users, provided you build in evaluation and approvals from the start." },
  { min: 75, name: "Ready to scale", text: "You have the foundations to run several agents. The next gains come from a shared platform and reusing what worked." },
];
