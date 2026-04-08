'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Mail,
  CreditCard,
  Linkedin,
  Slack,
  Book,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Building2,
  Workflow,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ConnectedTool {
  toolName: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [stripeKey, setStripeKey] = useState('');
  const [showStripeInput, setShowStripeInput] = useState(false);
  const [isSavingStripe, setIsSavingStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Fetch connected tools status
  const {
    data: connectedTools = [],
    isLoading: isLoadingTools,
    error: toolsError
  } = useQuery<ConnectedTool[]>({
    queryKey: ['tools-status'],
    queryFn: async () => {
      const response = await axios.get('/api/tools/status');
      return response.data;
    }
  });

  const isGmailConnected = connectedTools.some(t => t.toolName === 'gmail');
  const isStripeConnected = connectedTools.some(t => t.toolName === 'stripe');

  const handleSaveStripe = async () => {
    setStripeError(null);
    if (!stripeKey.startsWith('sk_test_') && !stripeKey.startsWith('sk_live_')) {
      setStripeError("Invalid key. Stripe keys start with sk_test_ or sk_live_");
      return;
    }

    setIsSavingStripe(true);
    try {
      await axios.post('/api/oauth/stripe', { stripeKey });
      toast.success("Stripe connected successfully.");
      setStripeKey('');
      setShowStripeInput(false);
      queryClient.invalidateQueries({ queryKey: ['tools-status'] });
    } catch (err) {
      setStripeError("Failed to save. Please try again.");
    } finally {
      setIsSavingStripe(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white font-syne mb-2">Settings</h1>
        <p className="text-slate-400">Manage integrations, connected accounts, and your startup profile.</p>
      </header>

      {/* Section 1: Connected Tools */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-100 font-medium text-lg">
          <Workflow className="h-5 w-5 text-emerald-500" />
          <h2>Connected Tools</h2>
        </div>

        {toolsError ? (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>Could not load connection status. Please refresh.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GMAIL CARD */}
            <Card className="bg-slate-900 border-slate-800 transition-all hover:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-red-500" />
                  </div>
                  {isLoadingTools ? (
                    <Skeleton className="h-5 w-20 rounded-full" />
                  ) : isGmailConnected ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-none px-2">
                      Connected <CheckCircle2 className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-800">
                      Not Connected
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">Gmail</CardTitle>
                <CardDescription>Link your Gmail for AI email automation.</CardDescription>
              </CardHeader>
              <CardFooter>
                {isLoadingTools ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : isGmailConnected ? (
                  <Button
                    variant="outline"
                    className="w-full border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => toast.info("Disconnect coming soon.")}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-slate-100 text-slate-900 hover:bg-white"
                    onClick={() => router.push('/api/oauth/google')}
                  >
                    Connect Gmail
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* STRIPE CARD */}
            <Card className="bg-slate-900 border-slate-800 transition-all hover:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-500" />
                  </div>
                  {isLoadingTools ? (
                    <Skeleton className="h-5 w-20 rounded-full" />
                  ) : isStripeConnected && !showStripeInput ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10 border-none px-2">
                      Connected <CheckCircle2 className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-800">
                      Not Connected
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-4">Stripe</CardTitle>
                <CardDescription>Integrate Stripe for revenue analysis.</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                {(showStripeInput || !isStripeConnected) && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Stripe Secret Key</label>
                      <Input
                        type="password"
                        placeholder="sk_test_..."
                        value={stripeKey}
                        onChange={(e) => setStripeKey(e.target.value)}
                        className="bg-slate-950 border-slate-800 text-white focus-visible:ring-blue-500/50"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <ShieldCheck className="h-3 w-3 text-emerald-500" />
                      <span>Encrypted and stored securely. Never shared.</span>
                    </div>
                    {stripeError && (
                      <p className="text-xs text-red-500 font-medium">{stripeError}</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {isLoadingTools ? (
                  <Skeleton className="h-10 w-full rounded-md" />
                ) : isStripeConnected && !showStripeInput ? (
                  <Button
                    variant="outline"
                    className="w-full border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                    onClick={() => setShowStripeInput(true)}
                  >
                    Update Key
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSaveStripe}
                    disabled={isSavingStripe || !stripeKey.trim()}
                  >
                    {isSavingStripe ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Key'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>

            {/* COMING SOON - LINKEDIN */}
            <Card className="bg-slate-900/50 border-slate-800/50 opacity-50 cursor-not-allowed pointer-events-none">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Linkedin className="h-5 w-5 text-slate-500" />
                  </div>
                  <Badge variant="outline" className="text-slate-600 border-slate-800/50">
                    Coming Soon
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4 text-slate-400">LinkedIn</CardTitle>
                <CardDescription>Social strategy and outbound growth.</CardDescription>
              </CardHeader>
              <CardFooter />
            </Card>

            {/* COMING SOON - SLACK */}
            <Card className="bg-slate-900/50 border-slate-800/50 opacity-50 cursor-not-allowed pointer-events-none">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Slack className="h-5 w-5 text-slate-500" />
                  </div>
                  <Badge variant="outline" className="text-slate-600 border-slate-800/50">
                    Coming Soon
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4 text-slate-400">Slack</CardTitle>
                <CardDescription>Internal notifications and team alerts.</CardDescription>
              </CardHeader>
              <CardFooter />
            </Card>

            {/* COMING SOON - NOTION */}
            <Card className="bg-slate-900/50 border-slate-800/50 opacity-50 cursor-not-allowed pointer-events-none">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Book className="h-5 w-5 text-slate-500" />
                  </div>
                  <Badge variant="outline" className="text-slate-600 border-slate-800/50">
                    Coming Soon
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-4 text-slate-400">Notion</CardTitle>
                <CardDescription>Knowledge base and task management.</CardDescription>
              </CardHeader>
              <CardFooter />
            </Card>
          </div>
        )}
      </section>

      {/* Section 2: Startup Profile */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-100 font-medium text-lg">
          <Building2 className="h-5 w-5 text-emerald-500" />
          <h2>Startup Profile</h2>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6 space-y-0 divide-y divide-slate-800">
            {sessionStatus === 'loading' ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-3 py-4 gap-2 sm:gap-4 items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full sm:col-span-2" />
                </div>
              ))
            ) : (
              <>
                <ProfileRow
                  label="Company Name"
                  value={session?.user?.name || "Not set"}
                />
                <ProfileRow
                  label="Industry"
                  value={(session?.user as any)?.industry || "Complete your profile"}
                />
                <ProfileRow
                  label="Stage"
                  value={(session?.user as any)?.stage || "Complete your profile"}
                />
                <ProfileRow
                  label="Team Size"
                  value={(session?.user as any)?.teamSize || "Complete your profile"}
                />
              </>
            )}
          </CardContent>
          <CardFooter className="bg-slate-900/50 border-t border-slate-800 py-4">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" asChild>
              <Link href="/onboarding">
                Edit Profile <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 py-4 gap-2 sm:gap-4 items-center">
      <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-slate-200 sm:col-span-2">{value}</span>
    </div>
  );
}
