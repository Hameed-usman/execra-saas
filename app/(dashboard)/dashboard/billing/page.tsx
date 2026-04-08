'use client';

import { PRICING_TIERS } from '@/lib/pricing';
import { PricingCard } from '@/components/shared/PricingCard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BillingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <header className="text-center space-y-3">
        <h1 className="text-4xl font-bold text-white font-syne tracking-tight">Billing & Plans</h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Choose the plan that fits your startup and unlock the full potential of AI-powered scaling.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {PRICING_TIERS.map((tier, index) => {
          const isFree = tier.name === "Free";
          const isPro = tier.name === "Pro";
          const isScale = tier.name === "Scale";

          return (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              index={index}
              actionButton={
                isFree ? (
                  <Button variant="outline" disabled className="w-full rounded-full border-slate-800 text-slate-500 py-6">
                    Current Plan
                  </Button>
                ) : isPro ? (
                  <Button 
                    className="w-full rounded-full bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-6"
                    onClick={() => toast.info("Billing coming soon. We will notify you when payments are live.")}
                  >
                    Upgrade to Pro
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full rounded-full border-slate-800 text-slate-300 hover:bg-slate-800 py-6"
                    onClick={() => toast.info("Email us at hello@execra.ai")}
                  >
                    Contact Sales
                  </Button>
                )
              }
            />
          );
        })}
      </div>

      <div className="mt-16 text-center">
        <p className="text-slate-500 text-sm">All plans include our core security infrastructure and data encryption protocols.</p>
      </div>
    </div>
  );
}
