"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Users,
  DollarSign,
  TrendingDown,
  Target,
  Clock,
  ArrowRight,
  ArrowLeft,
  Check,
  Zap,
  AlertTriangle,
  CreditCard,
  Loader2,
} from "lucide-react";
import type {
  FunnelState,
  NicheCategory,
  PrimaryGoal,
  BlueprintOption,
  GenerateBlueprintResponse,
} from "@/types/preview";

function cn(...inputs: Array<string | undefined | null | false>) {
  return twMerge(clsx(inputs));
}

const NICHE_OPTIONS: NicheCategory[] = [
  "SaaS / Tech / AI",
  "Trading / Finance",
  "Reselling",
  "Coaching / Agency",
  "Sports Betting",
  "Gaming / Other",
];

const NICHE_ICONS: Record<NicheCategory, string> = {
  "SaaS / Tech / AI": "🤖",
  "Trading / Finance": "📈",
  Reselling: "📦",
  "Coaching / Agency": "🎯",
  "Sports Betting": "🏆",
  "Gaming / Other": "🎮",
};

const GOAL_OPTIONS: PrimaryGoal[] = [
  "Increase Revenue",
  "Reduce Churn",
  "Boost Engagement",
  "Automate Operations",
  "Build a Custom Tool",
  "Launch a SaaS",
];

const GOAL_ICONS: Record<PrimaryGoal, string> = {
  "Increase Revenue": "💰",
  "Reduce Churn": "🔄",
  "Boost Engagement": "⚡",
  "Automate Operations": "⚙️",
  "Build a Custom Tool": "🔧",
  "Launch a SaaS": "🚀",
};

const TIMELINE_OPTIONS = [
  "ASAP / within 1 week",
  "Within a month",
  "2 months+",
] as const;

const WHOP_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_WHOP_CORE_PLAN_ID
    ? `https://whop.com/checkout/${process.env.NEXT_PUBLIC_WHOP_CORE_PLAN_ID}`
    : "https://whop.com/checkout/plan_9B7W0HkHBLinl";

interface WhopWizardEngineProps {
  experienceId: string;
}

export function WhopWizardEngine({ experienceId }: WhopWizardEngineProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [funnelState, setFunnelState] = useState<FunnelState>({
    communityName: "",
    niche: "" as NicheCategory,
    memberCount: 500,
    pricePerMonth: 25,
    primaryGoal: "" as PrimaryGoal,
    appIdea: "",
    launchTimeline: "ASAP / within 1 week",
    selectedBlueprintId: undefined,
  });
  const [blueprints, setBlueprints] = useState<BlueprintOption[]>([]);
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isLoggingLead, setIsLoggingLead] = useState(false);
  const [stepTransition, setStepTransition] = useState<
    "entering" | "entered" | "exiting"
  >("entered");
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const containerRef = useRef<HTMLDivElement>(null);

  const totalSteps = 9;

  const animateStep = useCallback(
    (nextStep: number, dir: "forward" | "backward") => {
      setDirection(dir);
      setStepTransition("exiting");
      setTimeout(() => {
        setCurrentStep(nextStep);
        setStepTransition("entering");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setStepTransition("entered");
          });
        });
      }, 200);
    },
    []
  );

  const goNext = useCallback(() => {
    if (currentStep < totalSteps) {
      animateStep(currentStep + 1, "forward");
    }
  }, [currentStep, animateStep]);

  const goBack = useCallback(() => {
    if (currentStep > 1) {
      animateStep(currentStep - 1, "backward");
    }
  }, [currentStep, animateStep]);

  const updateFunnel = useCallback(
    <K extends keyof FunnelState>(key: K, value: FunnelState[K]) => {
      setFunnelState((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  useEffect(() => {
    if (currentStep === 8 && blueprints.length === 0 && !isLoadingBlueprints) {
      const fetchBlueprints = async () => {
        setIsLoadingBlueprints(true);
        setBlueprintError(null);
        try {
          const response = await fetch("/api/generate-blueprint", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(funnelState),
          });
          const data: GenerateBlueprintResponse = await response.json();
          if (data.success) {
            setBlueprints(data.blueprints);
          } else {
            setBlueprintError(data.error || "Failed to generate blueprints");
          }
        } catch {
          setBlueprintError("Network error. Please check your connection.");
        } finally {
          setIsLoadingBlueprints(false);
        }
      };
      fetchBlueprints();
    }
  }, [currentStep, blueprints.length, isLoadingBlueprints, funnelState]);

  const logLeadAndProceed = useCallback(async () => {
    setIsLoggingLead(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSlug: experienceId,
          customerName: funnelState.communityName || "Whop Community Lead",
          customerPhone: "whop_lead",
          serviceType: `whop-queue:${funnelState.niche}:${funnelState.primaryGoal}`,
        }),
      });
    } catch {
      // Lead logging is best-effort; proceed regardless
    } finally {
      setIsLoggingLead(false);
      setShowConfirmationModal(true);
    }
  }, [experienceId, funnelState]);

  const annualLoss = Math.round(
    funnelState.memberCount * funnelState.pricePerMonth * 0.12 * 12
  );
  const monthlyLoss = Math.round(annualLoss / 12);

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% complete
          </span>
        </div>
        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div
        className={cn(
          "transition-all duration-200 ease-out",
          stepTransition === "entering" &&
            (direction === "forward"
              ? "opacity-0 translate-x-8"
              : "opacity-0 -translate-x-8"),
          stepTransition === "exiting" &&
            (direction === "forward"
              ? "opacity-0 -translate-x-8"
              : "opacity-0 translate-x-8"),
          stepTransition === "entered" && "opacity-100 translate-x-0"
        )}
      >
        {currentStep === 1 && (
          <Step1CommunityInfo
            communityName={funnelState.communityName}
            onChange={(name) => updateFunnel("communityName", name)}
          />
        )}
        {currentStep === 2 && (
          <Step2NicheSelector
            selected={funnelState.niche}
            onSelect={(niche) => updateFunnel("niche", niche)}
          />
        )}
        {currentStep === 3 && (
          <Step3MemberCount
            value={funnelState.memberCount}
            onChange={(count) => updateFunnel("memberCount", count)}
          />
        )}
        {currentStep === 4 && (
          <Step4PricePerMonth
            value={funnelState.pricePerMonth}
            onChange={(price) => updateFunnel("pricePerMonth", price)}
          />
        )}
        {currentStep === 5 && (
          <Step5ChurnAnchor
            annualLoss={annualLoss}
            monthlyLoss={monthlyLoss}
            memberCount={funnelState.memberCount}
            pricePerMonth={funnelState.pricePerMonth}
          />
        )}
        {currentStep === 6 && (
          <Step6GoalSelector
            selected={funnelState.primaryGoal}
            onSelect={(goal) => updateFunnel("primaryGoal", goal)}
            appIdea={funnelState.appIdea}
            onAppIdeaChange={(idea) => updateFunnel("appIdea", idea)}
          />
        )}
        {currentStep === 7 && (
          <Step7TimelineSelector
            selected={funnelState.launchTimeline}
            onSelect={(timeline) => updateFunnel("launchTimeline", timeline)}
          />
        )}
        {currentStep === 8 && (
          <Step8BlueprintSelection
            blueprints={blueprints}
            isLoading={isLoadingBlueprints}
            error={blueprintError}
            selectedId={funnelState.selectedBlueprintId}
            onSelect={(id) => updateFunnel("selectedBlueprintId", id)}
          />
        )}
        {currentStep === 9 && (
          <Step9ConversionGate
            communityName={funnelState.communityName}
            selectedBlueprintId={funnelState.selectedBlueprintId}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-10">
        <div>
          {currentStep > 1 && currentStep < 9 && (
            <button
              onClick={goBack}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium",
                "text-muted-foreground hover:text-foreground",
                "transition-colors duration-200"
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
        </div>
        <div>
          {currentStep < 8 && (
            <button
              onClick={goNext}
              disabled={!isStepValid(currentStep, funnelState)}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg",
                "bg-primary text-white hover:bg-primary-hover",
                "shadow-lg shadow-primary/25 hover:shadow-primary/40",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {currentStep === 8 && (
            <button
              onClick={goNext}
              disabled={!funnelState.selectedBlueprintId}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg",
                "bg-primary text-white hover:bg-primary-hover",
                "shadow-lg shadow-primary/25 hover:shadow-primary/40",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              Review Your Build
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showConfirmationModal && (
        <ConfirmationModal
          communityName={funnelState.communityName}
          onClose={() => setShowConfirmationModal(false)}
        />
      )}
    </div>
  );
}

function isStepValid(step: number, state: FunnelState): boolean {
  switch (step) {
    case 1:
      return state.communityName.trim().length > 0;
    case 2:
      return state.niche.length > 0;
    case 3:
      return state.memberCount >= 10;
    case 4:
      return state.pricePerMonth >= 5;
    case 5:
      return true;
    case 6:
      return state.primaryGoal.length > 0;
    case 7:
      return state.launchTimeline.length > 0;
    default:
      return true;
  }
}

function Step1CommunityInfo({
  communityName,
  onChange,
}: {
  communityName: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          What&apos;s your community called?
        </h2>
        <p className="text-muted-foreground mt-2">
          Enter the name of your Whop community so we can tailor everything to
          your brand.
        </p>
      </div>
      <div className="relative">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={communityName}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Apex Traders Club"
          className={cn(
            "w-full h-12 pl-11 pr-4 rounded-lg text-base",
            "bg-surface border border-border text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
            "transition-all duration-200"
          )}
          autoFocus
        />
      </div>
      <div className="rounded-lg bg-surface border border-border p-4">
        <p className="text-sm text-muted-foreground">
          This name will be used throughout your dashboard and in any automated
          messages sent to your members.
        </p>
      </div>
    </div>
  );
}

function Step2NicheSelector({
  selected,
  onSelect,
}: {
  selected: NicheCategory;
  onSelect: (niche: NicheCategory) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Pick your niche
        </h2>
        <p className="text-muted-foreground mt-2">
          Select the category that best describes your community so we can build
          the right tool for you.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {NICHE_OPTIONS.map((niche) => (
          <button
            key={niche}
            onClick={() => onSelect(niche)}
            className={cn(
              "relative flex flex-col items-center gap-3 p-5 rounded-xl",
              "border-2 transition-all duration-200",
              "hover:bg-surface/80",
              selected === niche
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-surface hover:border-muted"
            )}
          >
            <span className="text-3xl">{NICHE_ICONS[niche]}</span>
            <span
              className={cn(
                "text-sm font-medium text-center",
                selected === niche ? "text-primary" : "text-foreground"
              )}
            >
              {niche}
            </span>
            {selected === niche && (
              <div className="absolute top-2 right-2">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step3MemberCount({
  value,
  onChange,
}: {
  value: number;
  onChange: (count: number) => void;
}) {
  const formatNumber = (n: number) => {
    if (n >= 10000) return `${(n / 1000).toFixed(1)}k+`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          How many active paying members?
        </h2>
        <p className="text-muted-foreground mt-2">
          Drag the slider or type the number of members currently paying for
          your community.
        </p>
      </div>
      <div className="rounded-xl bg-surface border border-border p-8">
        <div className="text-center mb-8">
          <span className="text-5xl font-bold text-primary">
            {formatNumber(value)}
          </span>
          <span className="block text-sm text-muted-foreground mt-2">
            active paying members
          </span>
        </div>
        <input
          type="range"
          min={10}
          max={10000}
          step={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 rounded-full appearance-none cursor-pointer",
            "bg-border",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150",
            "[&::-webkit-slider-thumb]:hover:scale-110",
            "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
          )}
        />
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>10</span>
          <span>1,000</span>
          <span>5,000</span>
          <span>10,000+</span>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Or type an exact number
          </label>
          <input
            type="number"
            min={10}
            max={100000}
            value={value}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 10 && v <= 100000) onChange(v);
            }}
            className={cn(
              "w-full h-10 px-4 rounded-lg text-sm",
              "bg-surface border border-border text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
          />
        </div>
      </div>
    </div>
  );
}

function Step4PricePerMonth({
  value,
  onChange,
}: {
  value: number;
  onChange: (price: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          What&apos;s the average monthly price per member?
        </h2>
        <p className="text-muted-foreground mt-2">
          Include all tiers. If you have a $10 and $50 tier, estimate the
          average.
        </p>
      </div>
      <div className="rounded-xl bg-surface border border-border p-8">
        <div className="text-center mb-8">
          <span className="text-5xl font-bold text-primary">
            ${value.toLocaleString()}
          </span>
          <span className="block text-sm text-muted-foreground mt-2">
            per month per member
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={500}
          step={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 rounded-full appearance-none cursor-pointer",
            "bg-border",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6",
            "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary",
            "[&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150",
            "[&::-webkit-slider-thumb]:hover:scale-110",
            "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary",
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
          )}
        />
        <div className="flex justify-between mt-3 text-xs text-muted-foreground">
          <span>$5</span>
          <span>$100</span>
          <span>$250</span>
          <span>$500+</span>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Or type an exact amount
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="number"
              min={5}
              max={10000}
              step={5}
              value={value}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 5 && v <= 10000) onChange(v);
              }}
              className={cn(
                "w-full h-10 pl-9 pr-4 rounded-lg text-sm",
                "bg-surface border border-border text-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5ChurnAnchor({
  annualLoss,
  monthlyLoss,
  memberCount,
  pricePerMonth,
}: {
  annualLoss: number;
  monthlyLoss: number;
  memberCount: number;
  pricePerMonth: number;
}) {
  const [displayedAnnual, setDisplayedAnnual] = useState(0);
  const [displayedMonthly, setDisplayedMonthly] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplayedAnnual(Math.round(annualLoss * eased));
      setDisplayedMonthly(Math.round(monthlyLoss * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [annualLoss, monthlyLoss]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          You&apos;re leaving money on the table
        </h2>
        <p className="text-muted-foreground mt-2">
          Based on {memberCount.toLocaleString()} members paying $
          {pricePerMonth}/mo, here&apos;s what preventable churn costs you
          every year.
        </p>
      </div>
      <div className="rounded-xl bg-surface border border-border p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 border border-error/20 mb-4">
            <AlertTriangle className="h-4 w-4 text-error" />
            <span className="text-sm font-medium text-error">
              Revenue Leak Detected
            </span>
          </div>
          <div className="text-6xl font-bold text-error mb-2">
            ${displayedAnnual.toLocaleString()}
          </div>
          <span className="text-lg text-muted-foreground">
            per year in lost revenue
          </span>
        </div>
        <div className="h-px bg-border" />
        <div className="text-center">
          <div className="text-3xl font-semibold text-foreground">
            ${displayedMonthly.toLocaleString()}
          </div>
          <span className="text-sm text-muted-foreground mt-1 block">
            Roughly ${displayedMonthly.toLocaleString()}/mo leaving your
            community due to preventable churn.
          </span>
        </div>
        <div className="rounded-lg bg-background border border-border p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">The math:</span>{" "}
              We estimate 12% annual churn based on industry benchmarks for
              paid communities. At ${pricePerMonth}/mo ×{" "}
              {memberCount.toLocaleString()} members, that&apos;s{" "}
              <span className="text-foreground font-medium">
                ${(memberCount * pricePerMonth).toLocaleString()}/mo
              </span>{" "}
              in total revenue — and 12% of it walks out the door every year
              without intervention.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step6GoalSelector({
  selected,
  onSelect,
  appIdea,
  onAppIdeaChange,
}: {
  selected: PrimaryGoal;
  onSelect: (goal: PrimaryGoal) => void;
  appIdea: string;
  onAppIdeaChange: (idea: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          What&apos;s your primary goal?
        </h2>
        <p className="text-muted-foreground mt-2">
          This helps us prioritize the features that matter most to you.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {GOAL_OPTIONS.map((goal) => (
          <button
            key={goal}
            onClick={() => onSelect(goal)}
            className={cn(
              "relative flex flex-col items-center gap-3 p-5 rounded-xl",
              "border-2 transition-all duration-200",
              "hover:bg-surface/80",
              selected === goal
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-surface hover:border-muted"
            )}
          >
            <span className="text-3xl">{GOAL_ICONS[goal]}</span>
            <span
              className={cn(
                "text-sm font-medium text-center",
                selected === goal ? "text-primary" : "text-foreground"
              )}
            >
              {goal}
            </span>
            {selected === goal && (
              <div className="absolute top-2 right-2">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Describe your app idea{" "}
          <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          value={appIdea}
          onChange={(e) => onAppIdeaChange(e.target.value)}
          placeholder="e.g. I want a dashboard that shows my members their personalized trading performance and auto-generates weekly reports..."
          rows={4}
          className={cn(
            "w-full px-4 py-3 rounded-lg text-sm resize-none",
            "bg-surface border border-border text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
            "transition-all duration-200"
          )}
        />
        <p className="text-xs text-muted-foreground">
          The more detail you provide, the more tailored your blueprints will
          be.
        </p>
      </div>
    </div>
  );
}

function Step7TimelineSelector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (timeline: "ASAP / within 1 week" | "Within a month" | "2 months+") => void;
}) {
  const TIMELINE_DISPLAY: Record<string, { icon: string; urgency: string }> = {
    "ASAP / within 1 week": {
      icon: "⚡",
      urgency: "Highest priority — we'll move fast",
    },
    "Within a month": {
      icon: "📅",
      urgency: "Standard timeline — thorough build",
    },
    "2 months+": {
      icon: "🗓️",
      urgency: "Flexible — quality over speed",
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          When do you want to launch?
        </h2>
        <p className="text-muted-foreground mt-2">
          This affects your queue position and how aggressively we prioritize
          your build.
        </p>
      </div>
      <div className="space-y-3">
        {TIMELINE_OPTIONS.map((timeline) => {
          const display = TIMELINE_DISPLAY[timeline];
          return (
            <button
              key={timeline}
              onClick={() => onSelect(timeline)}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-xl",
                "border-2 transition-all duration-200 text-left",
                "hover:bg-surface/80",
                selected === timeline
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border bg-surface hover:border-muted"
              )}
            >
              <span className="text-3xl flex-shrink-0">{display.icon}</span>
              <div className="flex-1">
                <span
                  className={cn(
                    "text-base font-medium block",
                    selected === timeline ? "text-primary" : "text-foreground"
                  )}
                >
                  {timeline}
                </span>
                <span className="text-sm text-muted-foreground">
                  {display.urgency}
                </span>
              </div>
              {selected === timeline && (
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Step8BlueprintSelection({
  blueprints,
  isLoading,
  error,
  selectedId,
  onSelect,
}: {
  blueprints: BlueprintOption[];
  isLoading: boolean;
  error: string | null;
  selectedId: string | undefined;
  onSelect: (id: "option_a" | "option_b" | "option_c") => void;
}) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Generating your custom blueprints...
          </h2>
          <p className="text-muted-foreground mt-2">
            We&apos;re analyzing your inputs and tailoring 3 unique options.
          </p>
        </div>
        <div className="rounded-xl bg-surface border border-border p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">
              Building your blueprints...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Choose your blueprint
        </h2>
        <p className="text-muted-foreground mt-2">
          Three custom options tailored to your community. Pick the one that
          fits best.
        </p>
      </div>
      <div className="space-y-4">
        {blueprints.map((blueprint) => (
          <button
            key={blueprint.id}
            onClick={() => onSelect(blueprint.id)}
            className={cn(
              "w-full text-left rounded-xl p-6 border-2 transition-all duration-200",
              "hover:bg-surface/80",
              selectedId === blueprint.id
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-surface hover:border-muted"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      selectedId === blueprint.id
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary border border-primary/20"
                    )}
                  >
                    {blueprint.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Option{" "}
                    {blueprint.id === "option_a"
                      ? "A"
                      : blueprint.id === "option_b"
                        ? "B"
                        : "C"}
                  </span>
                </div>
                <h3
                  className={cn(
                    "text-lg font-semibold mb-1",
                    selectedId === blueprint.id
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {blueprint.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {blueprint.tagline}
                </p>
                <ul className="space-y-2 mb-4">
                  {blueprint.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-lg bg-background border border-border p-3">
                  <p className="text-sm text-muted-foreground italic">
                    {blueprint.whyItFits}
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0 mt-2">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedId === blueprint.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  )}
                >
                  {selectedId === blueprint.id && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
            </div>
            {selectedId === blueprint.id && (
              <div className="mt-4 pt-4 border-t border-primary/20">
                <span className="text-sm font-medium text-primary flex items-center gap-2">
                  Start building this <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step9ConversionGate({
  communityName,
  selectedBlueprintId,
}: {
  communityName: string;
  selectedBlueprintId: string | undefined;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
          <Clock className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            ~4 weeks current build queue
          </span>
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Ready to build{" "}
          {communityName ? `for ${communityName}` : "your app"}?
        </h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">
          Your blueprint is locked in. Choose how you want to proceed.
        </p>
      </div>

      <div className="space-y-4">
        <a
          href={WHOP_CHECKOUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-center gap-3 w-full p-6 rounded-xl",
            "bg-primary text-white hover:bg-primary-hover",
            "shadow-lg shadow-primary/25 hover:shadow-primary/40",
            "transition-all duration-200 group"
          )}
        >
          <CreditCard className="h-5 w-5" />
          <div className="text-left">
            <span className="text-lg font-semibold block">
              Skip the Line (Fast-Track in 3 Days)
            </span>
            <span className="text-sm text-white/80">
              Priority access — get your app built in 3 business days
            </span>
          </div>
          <ArrowRight className="h-5 w-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        <div className="relative flex items-center justify-center">
          <div className="h-px bg-border flex-1" />
          <span className="px-3 text-xs text-muted-foreground">or</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <button
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent("whop-wizard:queue-spot", {
                detail: { communityName, selectedBlueprintId },
              })
            );
          }}
          className={cn(
            "flex items-center justify-center gap-3 w-full p-6 rounded-xl",
            "bg-surface border-2 border-border text-foreground",
            "hover:border-muted hover:bg-surface/80",
            "transition-all duration-200"
          )}
        >
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div className="text-left">
            <span className="text-lg font-medium block">
              I&apos;ll wait — keep my free spot
            </span>
            <span className="text-sm text-muted-foreground">
              Join the queue at no cost. We&apos;ll notify you when it&apos;s
              your turn.
            </span>
          </div>
        </button>
      </div>

      <div className="rounded-xl bg-surface border border-border p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">$0</div>
            <div className="text-xs text-muted-foreground mt-1">
              Free queue option
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">~4 weeks</div>
            <div className="text-xs text-muted-foreground mt-1">
              Current wait time
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-success">3 days</div>
            <div className="text-xs text-muted-foreground mt-1">
              Fast-track speed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmationModal({
  communityName,
  onClose,
}: {
  communityName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-8 shadow-2xl">
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6 text-success" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            You&apos;re in the queue!
          </h3>
          <p className="text-muted-foreground mb-6">
            {communityName
              ? `${communityName} has been added to our free build queue.`
              : "Your community has been added to our free build queue."}{" "}
            We&apos;ll reach out when it&apos;s your turn.
          </p>
          <button
            onClick={onClose}
            className={cn(
              "w-full py-3 px-6 rounded-lg font-medium",
              "bg-primary text-white hover:bg-primary-hover",
              "transition-colors duration-200"
            )}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
