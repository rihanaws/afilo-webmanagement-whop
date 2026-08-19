import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type {
  FunnelState,
  BlueprintOption,
  GenerateBlueprintResponse,
  NicheCategory,
  PrimaryGoal,
} from "@/types/preview";

const NICHE_BLUEPRINT_TEMPLATES: Record<
  NicheCategory,
  {
    optionA: {
      title: string;
      tagline: string;
      features: string[];
      whyItFits: string;
    };
    optionB: {
      title: string;
      tagline: string;
      features: string[];
      whyItFits: string;
    };
    optionC: {
      title: string;
      tagline: string;
      features: string[];
      whyItFits: string;
    };
  }
> = {
  "SaaS / Tech / AI": {
    optionA: {
      title: "Product Command Center",
      tagline: "Centralize your SaaS metrics, user flows, and feature roadmap in one real-time dashboard.",
      features: [
        "Real-time MRR/ARR tracking with cohort segmentation",
        "Feature adoption analytics tied to retention curves",
        "Automated churn risk alerts based on usage patterns",
        "Integration with Stripe, Mixpanel, and your existing stack",
      ],
      whyItFits:
        "Your SaaS product needs a single source of truth for every metric that matters. This command center ties revenue, usage, and churn into one actionable view so you can ship features that actually move the needle.",
    },
    optionB: {
      title: "User Habit Loop Engine",
      tagline: "Design and track engagement loops that turn trial users into power users.",
      features: [
        "Onboarding flow builder with step-completion tracking",
        "Push notification orchestration based on user behavior",
        "A/B testing framework for activation experiments",
        "Cohort-based retention dashboards with day-1/7/30 views",
      ],
      whyItFits:
        "SaaS churn often starts in the first 7 days. This engine gives you the tools to instrument habit loops, measure activation, and iterate on onboarding until your trial-to-paid conversion climbs.",
    },
    optionC: {
      title: "Unit Economics Dashboard",
      tagline: "Track LTV, CAC, and payback period in real time across every acquisition channel.",
      features: [
        "CAC payback period calculator by channel",
        "LTV projection engine with expansion revenue modeling",
        "Investor-ready financial summary auto-generation",
        "Burn rate and runway projections with scenario planning",
      ],
      whyItFits:
        "Investors and your own sanity demand clear unit economics. This dashboard auto-calculates the metrics that determine whether your SaaS is a business or a hobby, and surfaces exactly where to double down.",
    },
  },
  "Trading / Finance": {
    optionA: {
      title: "Portfolio Operations Hub",
      tagline: "Consolidate all your trading accounts, positions, and P&L into a unified command center.",
      features: [
        "Multi-broker account aggregation with real-time sync",
        "Position sizing calculator with risk-per-trade limits",
        "Daily P&L breakdown with win/loss ratio analytics",
        "Trade journal with screenshot capture and tagging",
      ],
      whyItFits:
        "Managing trades across multiple brokers and strategies creates chaos. This hub gives you one clean view of every position, every dollar at risk, and every trade outcome so you can focus on execution, not spreadsheets.",
    },
    optionB: {
      title: "Signal Performance Tracker",
      tagline: "Backtest, track, and optimize your trading signals with automated performance analytics.",
      features: [
        "Historical backtesting engine with drawdown analysis",
        "Signal-to-execution latency tracking",
        "Win rate and expectancy calculations by setup type",
        "Automated performance reports for investor transparency",
      ],
      whyItFits:
        "A signal is only as good as its track record. This tracker turns your trading ideas into measurable, auditable performance data so you can refine what works and cut what doesn't.",
    },
    optionC: {
      title: "Revenue Attribution Dashboard",
      tagline: "See exactly which strategies, signals, and timeframes generate the most profit per dollar risked.",
      features: [
        "Strategy-level P&L attribution with Sharpe ratio",
        "Risk-adjusted return calculations across all positions",
        "Monthly investor distribution tracking and reporting",
        "Tax lot tracking for optimized year-end reporting",
      ],
      whyItFits:
        "Not all profits are created equal. This dashboard shows you the real risk-adjusted return of every strategy so you can allocate capital to what actually works and stop nursing underperformers.",
    },
  },
  Reselling: {
    optionA: {
      title: "Inventory Command Center",
      tagline: "Track stock levels, supplier margins, and sell-through rates across all your reselling channels.",
      features: [
        "Multi-channel inventory sync (eBay, Amazon, Shopify, local)",
        "Profit margin calculator per SKU with fees factored in",
        "Low-stock and reorder alerts with supplier lead time tracking",
        "Sales velocity analytics to predict restock timing",
      ],
      whyItFits:
        "Reselling lives and dies by inventory management. This command center gives you real-time visibility into what's in stock, what's moving, and what's dead so you can turn inventory faster and profit harder.",
    },
    optionB: {
      title: "Listing Optimization Engine",
      tagline: "A/B test titles, descriptions, and pricing to maximize conversion across every marketplace.",
      features: [
        "Multi-marketplace listing performance comparison",
        "Price elasticity testing with demand curve visualization",
        "SEO keyword tracker for listing title optimization",
        "Competitor price monitoring with automated repricing triggers",
      ],
      whyItFits:
        "The same product can sell 10x more with the right listing. This engine lets you test and optimize every element of your listings so you stop guessing and start converting.",
    },
    optionC: {
      title: "Profit Analytics Dashboard",
      tagline: "See your true profit after all fees, shipping, and costs with automated margin tracking.",
      features: [
        "All-in cost calculator (fees, shipping, packaging, returns)",
        "Monthly profit trend analysis with growth projections",
        "Category-level profitability breakdown",
        "Tax-ready export with COGS and expense categorization",
      ],
      whyItFits:
        "Revenue means nothing without profit. This dashboard subtracts every hidden cost so you know your real margins and can make smart sourcing decisions backed by actual numbers.",
    },
  },
  "Coaching / Agency": {
    optionA: {
      title: "Client Delivery Dashboard",
      tagline: "Manage all client projects, deliverables, and timelines in one streamlined operations view.",
      features: [
        "Client project board with status tracking and deadlines",
        "Automated progress reports generated from task completion",
        "Scope creep detection with change order workflows",
        "Client satisfaction pulse surveys with NPS tracking",
      ],
      whyItFits:
        "Scaling an agency means delivering consistently without dropping balls. This dashboard gives you operational visibility across every client so you can catch bottlenecks before they become fires.",
    },
    optionB: {
      title: "Client Success Engine",
      tagline: "Track client outcomes, health scores, and renewal risk to maximize lifetime value.",
      features: [
        "Client health score algorithm based on engagement metrics",
        "Automated renewal reminders with 30/60/90 day triggers",
        "Case study generator from client milestone achievements",
        "Referral tracking with automated thank-you workflows",
      ],
      whyItFits:
        "Retaining a client costs 5x less than acquiring a new one. This engine monitors client health in real time so you can intervene before churn happens and turn happy clients into referral machines.",
    },
    optionC: {
      title: "Revenue Forecasting Hub",
      tagline: "Project monthly revenue, pipeline value, and capacity utilization with data-driven models.",
      features: [
        "Pipeline-weighted revenue forecast with confidence intervals",
        "Team capacity planner with utilization rate tracking",
        "Monthly recurring revenue growth projections",
        "Scenario modeling for hiring, pricing, and expansion decisions",
      ],
      whyItFits:
        "Growing an agency without forecasting is flying blind. This hub turns your pipeline and delivery data into actionable revenue projections so you can hire, price, and scale with confidence.",
    },
  },
  "Sports Betting": {
    optionA: {
      title: "Bet Tracking Command Center",
      tagline: "Log every bet, track ROI by sport/sport/book, and see your true edge in real time.",
      features: [
        "Multi-book odds comparison with best-line finder",
        "ROI tracking by sport, bet type, and closing line value",
        "Bankroll management calculator with Kelly criterion sizing",
        "Bet history with advanced filtering and export",
      ],
      whyItFits:
        "Winning at sports betting requires disciplined tracking. This command center gives you the analytics to see where your edge actually is and the tools to size bets optimally so you don't blow up your bankroll.",
    },
    optionB: {
      title: "Line Movement Analyzer",
      tagline: "Track sharp vs. public money movements and identify profitable entry points before the line shifts.",
      features: [
        "Real-time line movement alerts across all major books",
        "Sharp money indicator with reverse-line movement detection",
        "Historical line data for backtesting betting strategies",
        "Value bet calculator comparing your model to market odds",
      ],
      whyItFits:
        "The line is the product in sports betting. This analyzer shows you how the market is moving and where the sharp money is going so you can get the best number before it's gone.",
    },
    optionC: {
      title: "P&L & Tax Dashboard",
      tagline: "Automate your betting P&L tracking and generate tax-ready reports at year end.",
      features: [
        "Automated P&L calculation across all books and payment methods",
        "Tax-loss harvesting tracker for winning/losing positions",
        "Monthly and yearly performance summaries with graphs",
        "CPA-ready export with itemized wins, losses, and offsets",
      ],
      whyItFits:
        "Tracking betting taxes manually is a nightmare. This dashboard automates the entire process so you stay compliant and focused on what matters — finding value at the window.",
    },
  },
  "Gaming / Other": {
    optionA: {
      title: "Community Operations Hub",
      tagline: "Manage members, events, and engagement across your gaming community from one dashboard.",
      features: [
        "Member activity tracker with engagement scoring",
        "Event scheduler with RSVP tracking and reminders",
        "Role-based access control with automated promotions",
        "Cross-platform sync (Discord, Twitch, YouTube, Whop)",
      ],
      whyItFits:
        "Running a gaming community across multiple platforms is chaos. This hub centralizes everything so you can focus on creating experiences instead of managing logistics.",
    },
    optionB: {
      title: "Content Performance Engine",
      tagline: "Track which content drives memberships, engagement, and revenue across all your channels.",
      features: [
        "Content-to-conversion attribution across platforms",
        "Best posting time analyzer based on audience activity",
        "Competitor content benchmarking with gap analysis",
        "Content calendar with performance预测 and scheduling",
      ],
      whyItFits:
        "Content is the growth engine for gaming communities. This engine shows you exactly what content works, when to post it, and how it translates into revenue so you can create smarter, not harder.",
    },
    optionC: {
      title: "Monetization Optimizer",
      tagline: "Test pricing tiers, bundle offerings, and upsell flows to maximize community revenue per member.",
      features: [
        "A/B testing framework for pricing and packaging",
        "Upsell flow builder with conversion tracking",
        "Member lifetime value calculator by tier and tenure",
        "Churn prediction with automated retention offers",
      ],
      whyItFits:
        "Most gaming communities leave money on the table. This optimizer tests and refunes every monetization lever so you extract maximum value without alienating your core audience.",
    },
  },
};

const GOAL_MODIFIERS: Record<PrimaryGoal, (features: string[]) => string[]> = {
  "Increase Revenue": (features) => [
    ...features.map((f) => `[Revenue Focus] ${f}`),
    "Upsell and cross-sell automation to maximize ARPU",
  ],
  "Reduce Churn": (features) => [
    ...features.map((f) => `[Retention Focus] ${f}`),
    "Predictive churn alerts with automated win-back campaigns",
  ],
  "Boost Engagement": (features) => [
    ...features.map((f) => `[Engagement Focus] ${f}`),
    "Gamification layer with streaks, badges, and leaderboards",
  ],
  "Automate Operations": (features) => [
    ...features.map((f) => `[Automation Focus] ${f}`),
    "Workflow automation engine with custom trigger-action rules",
  ],
  "Build a Custom Tool": (features) => [
    ...features.map((f) => `[Custom Build] ${f}`),
    "Modular component architecture for rapid feature iteration",
  ],
  "Launch a SaaS": (features) => [
    ...features.map((f) => `[SaaS Launch] ${f}`),
    "MVP launch toolkit with onboarding flow and billing integration",
  ],
};

function buildBlueprints(state: FunnelState): BlueprintOption[] {
  const templates = NICHE_BLUEPRINT_TEMPLATES[state.niche];
  const goalModifier = GOAL_MODIFIERS[state.primaryGoal];
  const appIdeaContext = state.appIdea
    ? ` Built specifically around your concept: "${state.appIdea}".`
    : "";

  const baseBlueprints: BlueprintOption[] = [
    {
      id: "option_a",
      badge: "Operations",
      title: templates.optionA.title,
      tagline: templates.optionA.tagline,
      features: goalModifier(templates.optionA.features),
      whyItFits: templates.optionA.whyItFits + appIdeaContext,
    },
    {
      id: "option_b",
      badge: "Engagement",
      title: templates.optionB.title,
      tagline: templates.optionB.tagline,
      features: goalModifier(templates.optionB.features),
      whyItFits: templates.optionB.whyItFits + appIdeaContext,
    },
    {
      id: "option_c",
      badge: "Growth",
      title: templates.optionC.title,
      tagline: templates.optionC.tagline,
      features: goalModifier(templates.optionC.features),
      whyItFits: templates.optionC.whyItFits + appIdeaContext,
    },
  ];

  return baseBlueprints;
}

function validateFunnelState(data: unknown): data is FunnelState {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;

  const validNiches: NicheCategory[] = [
    "SaaS / Tech / AI",
    "Trading / Finance",
    "Reselling",
    "Coaching / Agency",
    "Sports Betting",
    "Gaming / Other",
  ];
  const validGoals: PrimaryGoal[] = [
    "Increase Revenue",
    "Reduce Churn",
    "Boost Engagement",
    "Automate Operations",
    "Build a Custom Tool",
    "Launch a SaaS",
  ];
  const validTimelines = ["ASAP / within 1 week", "Within a month", "2 months+"];

  if (typeof obj.communityName !== "string" || obj.communityName.trim() === "")
    return false;
  if (!validNiches.includes(obj.niche as NicheCategory)) return false;
  if (typeof obj.memberCount !== "number" || obj.memberCount < 10) return false;
  if (typeof obj.pricePerMonth !== "number" || obj.pricePerMonth < 5) return false;
  if (!validGoals.includes(obj.primaryGoal as PrimaryGoal)) return false;
  if (typeof obj.appIdea !== "string") return false;
  if (!validTimelines.includes(obj.launchTimeline as string)) return false;

  return true;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateBlueprintResponse>> {
  try {
    const body = await request.json();

    if (!validateFunnelState(body)) {
      return NextResponse.json(
        {
          success: false,
          churnMetrics: { annualLoss: 0, monthlyLoss: 0 },
          blueprints: [],
          error: "Invalid funnel state. Please check all fields and try again.",
        },
        { status: 400 }
      );
    }

    const state = body as FunnelState;

    const annualLoss = Math.round(
      state.memberCount * state.pricePerMonth * 0.12 * 12
    );
    const monthlyLoss = Math.round(annualLoss / 12);

    const blueprints = buildBlueprints(state);

    return NextResponse.json({
      success: true,
      churnMetrics: {
        annualLoss,
        monthlyLoss,
      },
      blueprints,
    });
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return NextResponse.json(
      {
        success: false,
        churnMetrics: { annualLoss: 0, monthlyLoss: 0 },
        blueprints: [],
        error: "Internal server error. Please try again.",
      },
      { status: 500 }
    );
  }
}
