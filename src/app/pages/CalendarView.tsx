import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockSubscriptions } from '../data/subscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { format, parseISO, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'calendar' | 'timeline'>('timeline');

  const subscriptionsWithDates = useMemo(() => {
    return mockSubscriptions
      .filter(s => s.trialEndDate || s.status === 'active')
      .map(s => ({
        ...s,
        daysUntilExpiry: s.trialEndDate ? differenceInDays(parseISO(s.trialEndDate), new Date()) : null,
        expiryDate: s.trialEndDate ? parseISO(s.trialEndDate) : null
      }))
      .sort((a, b) => {
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return a.expiryDate.getTime() - b.expiryDate.getTime();
      });
  }, []);

  const categorizeByExpiry = (days: number) => {
    return subscriptionsWithDates.filter(s => {
      if (s.daysUntilExpiry === null) return false;
      return s.daysUntilExpiry <= days && s.daysUntilExpiry >= 0;
    });
  };

  const expiring1Day = categorizeByExpiry(1);
  const expiring3Days = categorizeByExpiry(3);
  const expiring7Days = categorizeByExpiry(7);
  const expiring30Days = categorizeByExpiry(30);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getSubscriptionsForDay = (day: Date) => {
    return subscriptionsWithDates.filter(s => s.expiryDate && isSameDay(s.expiryDate, day));
  };

  const getStatusColor = (daysUntil: number | null) => {
    if (daysUntil === null) return 'bg-muted';
    if (daysUntil <= 1) return 'bg-red-500';
    if (daysUntil <= 3) return 'bg-orange-500';
    if (daysUntil <= 7) return 'bg-yellow-500';
    if (daysUntil <= 30) return 'bg-blue-500';
    return 'bg-muted';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1>Expiry Calendar</h1>
        <p className="text-muted-foreground mt-2">
          Track trial expirations and renewal dates
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-semibold text-red-600">{expiring1Day.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Expiring in 1 day</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-semibold text-orange-600">{expiring3Days.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Expiring in 3 days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-semibold text-yellow-600">{expiring7Days.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Expiring in 7 days</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-semibold text-blue-600">{expiring30Days.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Expiring in 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <Tabs value={selectedView} onValueChange={(v) => setSelectedView(v as any)}>
        <TabsList>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-6 mt-6">
          {/* Expiring Soon */}
          {expiring7Days.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Expiring This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {expiring7Days.map(sub => (
                  <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(sub.daysUntilExpiry)} shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{sub.toolName}</h4>
                        <p className="text-sm text-muted-foreground break-all">{sub.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">
                          {sub.daysUntilExpiry === 0 ? 'Today' : sub.daysUntilExpiry === 1 ? 'Tomorrow' : `${sub.daysUntilExpiry} days`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.expiryDate && format(sub.expiryDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Link to={`/subscription/${sub.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Expiring This Month */}
          <Card>
            <CardHeader>
              <CardTitle>Expiring This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expiring30Days.filter(s => (s.daysUntilExpiry || 0) > 7).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subscriptions expiring beyond 7 days
                </p>
              ) : (
                expiring30Days.filter(s => (s.daysUntilExpiry || 0) > 7).map(sub => (
                  <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(sub.daysUntilExpiry)} shrink-0`} />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">{sub.toolName}</h4>
                        <p className="text-sm text-muted-foreground break-all">{sub.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-medium">{sub.daysUntilExpiry} days</p>
                        <p className="text-xs text-muted-foreground">
                          {sub.expiryDate && format(sub.expiryDate, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Link to={`/subscription/${sub.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* All Upcoming */}
          <Card>
            <CardHeader>
              <CardTitle>All Upcoming Expiries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscriptionsWithDates.filter(s => (s.daysUntilExpiry || 0) > 30).map(sub => (
                <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-muted shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium">{sub.toolName}</h4>
                      <p className="text-sm text-muted-foreground break-all">{sub.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                    <div className="text-left sm:text-right">
                      {sub.daysUntilExpiry && (
                        <p className="text-sm font-medium">{sub.daysUntilExpiry} days</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {sub.expiryDate && format(sub.expiryDate, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Link to={`/subscription/${sub.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Today
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Days of the month */}
                {daysInMonth.map(day => {
                  const subsForDay = getSubscriptionsForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div
                      key={day.toISOString()}
                      className={`
                        aspect-square p-1 sm:p-2 rounded-lg border border-border
                        ${isToday ? 'bg-accent border-primary' : 'bg-card'}
                      `}
                    >
                      <div className="h-full flex flex-col">
                        <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{format(day, 'd')}</div>
                        <div className="flex-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                          {subsForDay.slice(0, 2).map(sub => (
                            <div
                              key={sub.id}
                              className="text-[10px] sm:text-xs p-0.5 sm:p-1 rounded bg-primary/10 truncate"
                              title={sub.toolName}
                            >
                              <span className="hidden sm:inline">{sub.toolName}</span>
                              <span className="sm:hidden">{sub.toolName.slice(0, 3)}</span>
                            </div>
                          ))}
                          {subsForDay.length > 2 && (
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              +{subsForDay.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
