import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscriptions } from '../data/useSubscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Mail,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  DollarSign,
} from 'lucide-react';
import { cn } from '../components/ui/utils';
import { format, parseISO } from 'date-fns';
import { ToolIcon } from '../components/ToolIcon';

// Get login method display info from the stored loginMethod value — never infer from email domain
function getLoginMethodDisplay(loginMethod: string | undefined): { label: string; color: string; icon: React.ReactNode } {
  switch (loginMethod) {
    case 'google':
      return {
        label: 'Google',
        color: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        ),
      };
    case 'github':
      return {
        label: 'GitHub',
        color: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-current">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
        ),
      };
    case 'microsoft':
      return {
        label: 'Microsoft',
        color: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0">
            <path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#00A4EF" d="M13 1h10v10H13z"/>
            <path fill="#7FBA00" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/>
          </svg>
        ),
      };
    case 'apple':
      return {
        label: 'Apple',
        color: 'bg-slate-500/10 border-slate-500/30 text-slate-300',
        icon: (
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 shrink-0 fill-current">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        ),
      };
    default: // 'email' or any unrecognised value — always show Email / Password
      return {
        label: 'Email',
        color: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
        icon: <Mail className="w-3.5 h-3.5 shrink-0" />,
      };
  }
}

export function Accounts() {
  const { subscriptions, loading } = useSubscriptions();
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());

  const emailStats = useMemo(() => {
    const grouped: Record<string, typeof subscriptions> = {};
    subscriptions.forEach(sub => {
      if (!grouped[sub.email]) grouped[sub.email] = [];
      grouped[sub.email].push(sub);
    });

    return Object.entries(grouped)
      .map(([email, subs]) => {
        const active = subs.filter(s => s.status === 'active').length;
        const trials = subs.filter(s => s.status === 'trial').length;
        const expired = subs.filter(s => s.status === 'expired').length;
        const totalSpend = subs.reduce((sum, s) => sum + (s.price || 0), 0);
        const loginMethod = getLoginMethodDisplay(subs[0]?.loginMethod);

        return { email, subs, active, trials, expired, total: subs.length, totalSpend, loginMethod };
      })
      .sort((a, b) => b.total - a.total);
  }, [subscriptions]);

  const totalEmails = emailStats.length;
  const mostActive = emailStats.length > 0 ? emailStats[0] : null;
  const totalMonthlySpend = subscriptions.reduce((sum, s) => {
    if (s.status !== 'active') return sum;
    if (s.billingCycle === 'monthly') return sum + s.price;
    if (s.billingCycle === 'yearly') return sum + s.price / 12;
    return sum;
  }, 0);

  const toggleEmail = (email: string) => {
    setExpandedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email); else next.add(email);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading accounts...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Accounts & Emails</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          All email accounts used for subscriptions and trials
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-[#131A2A] border-indigo-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Accounts
            </CardTitle>
            <Mail className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalEmails}</div>
            <p className="text-xs text-muted-foreground mt-1">
              across {subscriptions.length} subscription{subscriptions.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-[#131A2A] border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Most Used Account
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mostActive?.total ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {mostActive?.email ?? 'No accounts yet'}
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-[#131A2A] border-violet-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Monthly Spend
            </CardTitle>
            <DollarSign className="w-4 h-4 text-violet-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalMonthlySpend.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              across all active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accounts List */}
      {emailStats.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-10 h-10 mx-auto text-muted-foreground opacity-30 mb-3" />
            <p className="text-muted-foreground">No accounts yet. Add a subscription to get started.</p>
            <Link to="/add"><Button className="mt-4" size="sm">Add Subscription</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {emailStats.map(stat => {
            const isExpanded = expandedEmails.has(stat.email);
            return (
              <Card key={stat.email} className="overflow-hidden">
                {/* Account header — clickable */}
                <button
                  type="button"
                  onClick={() => toggleEmail(stat.email)}
                  className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {stat.loginMethod.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">{stat.email}</p>
                        <Badge variant="outline" className={cn('rounded-full text-[10px] px-2 py-0 flex items-center gap-1', stat.loginMethod.color)}>
                          {stat.loginMethod.icon}
                          {stat.loginMethod.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{stat.total} subscription{stat.total !== 1 ? 's' : ''}</span>
                        {stat.active > 0 && <span className="text-emerald-400">{stat.active} active</span>}
                        {stat.trials > 0 && <span className="text-amber-400">{stat.trials} trial{stat.trials !== 1 ? 's' : ''}</span>}
                        {stat.expired > 0 && <span className="text-rose-400">{stat.expired} expired</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {stat.totalSpend > 0 && (
                      <span className="text-sm font-medium text-foreground">${stat.totalSpend.toFixed(0)}</span>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded — subscriptions list */}
                {isExpanded && (
                  <div className="border-t border-border bg-card/50 p-3 space-y-2">
                    {stat.subs.map(sub => (
                      <Link
                        key={sub.id}
                        to={`/subscription/${sub.id}`}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ToolIcon toolName={sub.toolName} website={sub.website} size="md" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{sub.toolName}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px] rounded-full px-2 py-0',
                                  sub.status === 'active' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
                                  sub.status === 'trial' && 'border-amber-500/40 bg-amber-500/10 text-amber-500',
                                  sub.status === 'expired' && 'border-rose-500/40 bg-rose-500/10 text-rose-500',
                                )}
                              >
                                {sub.status}
                              </Badge>
                              {sub.price > 0 && (
                                <span className="text-xs text-muted-foreground">${sub.price}/{sub.billingCycle ?? 'mo'}</span>
                              )}
                              {sub.trialEndDate && sub.status === 'trial' && (
                                <span className="text-xs text-amber-400">
                                  ends {format(parseISO(sub.trialEndDate), 'MMM d')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
