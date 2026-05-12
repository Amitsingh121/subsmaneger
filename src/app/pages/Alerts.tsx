import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSubscriptions } from '../data/useSubscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { AlertTriangle, Clock, ChevronDown, ChevronRight, ExternalLink, Loader2, Zap } from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '../components/ui/utils';
import { ToolIcon } from '../components/ToolIcon';

export function Alerts() {
  const { subscriptions, loading } = useSubscriptions();
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

  // Duplicate trials — tools with more than 1 subscription
  const duplicates = useMemo(() => {
    const grouped: Record<string, typeof subscriptions> = {};
    subscriptions.forEach(sub => {
      if (!grouped[sub.toolName]) grouped[sub.toolName] = [];
      grouped[sub.toolName].push(sub);
    });
    return Object.entries(grouped)
      .filter(([, subs]) => subs.length > 1)
      .map(([toolName, subs]) => ({ toolName, count: subs.length, subscriptions: subs }))
      .sort((a, b) => b.count - a.count);
  }, [subscriptions]);

  // Trials ending this week
  const trialsEndingThisWeek = useMemo(() => {
    return subscriptions.filter(s => {
      if (!s.trialEndDate || s.status !== 'trial') return false;
      const daysLeft = differenceInDays(parseISO(s.trialEndDate), new Date());
      return daysLeft >= 0 && daysLeft <= 7;
    }).sort((a, b) => {
      const da = a.trialEndDate ? parseISO(a.trialEndDate).getTime() : 0;
      const db = b.trialEndDate ? parseISO(b.trialEndDate).getTime() : 0;
      return da - db;
    });
  }, [subscriptions]);

  const toggleTool = (toolName: string) => {
    setExpandedTools(prev => {
      const next = new Set(prev);
      if (next.has(toolName)) next.delete(toolName);
      else next.add(toolName);
      return next;
    });
  };

  const totalAlerts = duplicates.length + trialsEndingThisWeek.length;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading alerts...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Alerts & Duplicate Trials</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Duplicate subscriptions and upcoming expirations
        </p>
      </div>

      {/* Summary */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                {totalAlerts} Alert{totalAlerts !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                {duplicates.length} duplicate tool{duplicates.length !== 1 ? 's' : ''} • {trialsEndingThisWeek.length} trial{trialsEndingThisWeek.length !== 1 ? 's' : ''} ending soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Duplicate Trials ── */}
      <Card className="border-orange-200 dark:border-orange-800/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <CardTitle className="text-base">
              Duplicate Trials ({duplicates.length})
            </CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tools with multiple subscriptions using different accounts. Click to expand.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {duplicates.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No duplicates found — you're clean!</p>
          ) : (
            duplicates.map(dup => {
              const isExpanded = expandedTools.has(dup.toolName);
              return (
                <div key={dup.toolName} className="rounded-xl border border-orange-200 dark:border-orange-800/40 overflow-hidden">
                  {/* Tool header — clickable */}
                  <button
                    type="button"
                    onClick={() => toggleTool(dup.toolName)}
                    className="w-full flex items-center justify-between p-4 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <ToolIcon toolName={dup.toolName} size="lg" />
                      <div>
                        <h4 className="font-medium text-foreground">{dup.toolName}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {dup.count} accounts • {dup.subscriptions.filter(s => s.status === 'trial').length} active trials
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-orange-500/10 border-orange-500/30 text-orange-500 text-xs">
                        {dup.count}
                      </Badge>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {/* Expanded — show all subscriptions under this tool */}
                  {isExpanded && (
                    <div className="border-t border-orange-200 dark:border-orange-800/40 bg-card/50 p-3 space-y-2">
                      {dup.subscriptions.map(sub => {
                        const daysLeft = sub.trialEndDate ? differenceInDays(parseISO(sub.trialEndDate), new Date()) : null;
                        return (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-background hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{sub.email}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                                  <span className="text-xs text-muted-foreground">
                                    ${sub.price}/{sub.billingCycle ?? 'mo'}
                                  </span>
                                )}
                                {daysLeft !== null && sub.status === 'trial' && (
                                  <span className={cn(
                                    'text-xs font-medium',
                                    daysLeft <= 3 ? 'text-rose-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-muted-foreground',
                                  )}>
                                    {daysLeft <= 0 ? 'expired' : `${daysLeft}d left`}
                                  </span>
                                )}
                                {sub.trialEndDate && (
                                  <span className="text-xs text-muted-foreground">
                                    ends {format(parseISO(sub.trialEndDate), 'MMM d')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link to={`/subscription/${sub.id}`}>
                              <Button variant="ghost" size="sm" className="shrink-0 text-xs">
                                View <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ── Trials Ending This Week ── */}
      {trialsEndingThisWeek.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-base">
                Trials Ending This Week ({trialsEndingThisWeek.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {trialsEndingThisWeek.map(sub => {
              const daysLeft = sub.trialEndDate ? differenceInDays(parseISO(sub.trialEndDate), new Date()) : 0;
              return (
                <div key={sub.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      daysLeft <= 1 ? 'bg-rose-500' : daysLeft <= 3 ? 'bg-amber-500' : 'bg-yellow-500',
                    )} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{sub.toolName}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-medium',
                        daysLeft <= 1 ? 'text-rose-400' : 'text-amber-400',
                      )}>
                        {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {sub.trialEndDate && format(parseISO(sub.trialEndDate), 'MMM d')}
                      </p>
                    </div>
                    <Link to={`/subscription/${sub.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">View</Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalAlerts === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-lg">All Clear!</h3>
              <p className="text-muted-foreground mt-2 text-sm">
                No duplicates or expiring trials found
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
