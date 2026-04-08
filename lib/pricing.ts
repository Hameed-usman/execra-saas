export interface PricingTier {
  name: string;
  price: string;
  interval: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted: boolean;
  comingSoon?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    interval: "/month",
    description: "Perfect for exploring the platform and basic automation.",
    features: [
      "5 agent runs per month",
      "BD Agent only",
      "Email support",
      "30-day activity history"
    ],
    buttonText: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    interval: "/month",
    description: "The complete suite for operating and scaling your startup.",
    features: [
      "Unlimited agent runs",
      "BD Agent + CFO Agent",
      "Persistent startup memory",
      "Priority email support",
      "Full activity history"
    ],
    buttonText: "Start Pro",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$199",
    interval: "/month",
    description: "For established teams needing high-volume agent operations.",
    features: [
      "Everything in Pro",
      "HR Agent + Scout Agent",
      "Team collaboration",
      "Role-based access",
      "Dedicated support"
    ],
    buttonText: "Contact sales",
    highlighted: false,
    comingSoon: true
  },
];
