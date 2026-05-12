import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { mockSubscriptions, getUniquePaymentMethods } from '../data/subscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';

export function PaymentMethods() {
  const paymentMethods = getUniquePaymentMethods();

  const paymentStats = useMemo(() => {
    return paymentMethods.map(method => {
      const subs = mockSubscriptions.filter(s => s.paymentMethod === method);
      const activeSubs = subs.filter(s => s.status === 'active');

      const monthlySpend = activeSubs.reduce((sum, sub) => {
        if (sub.billingCycle === 'monthly') return sum + sub.price;
        if (sub.billingCycle === 'yearly') return sum + (sub.price / 12);
        return sum;
      }, 0);

      return {
        method,
        total: subs.length,
        active: activeSubs.length,
        monthlySpend,
        subscriptions: subs
      };
    }).sort((a, b) => b.monthlySpend - a.monthlySpend);
  }, [paymentMethods]);

  const totalMonthlySpend = paymentStats.reduce((sum, stat) => sum + stat.monthlySpend, 0);
  const totalActive = paymentStats.reduce((sum, stat) => sum + stat.active, 0);

  const getPaymentIcon = (method: string) => {
    return <CreditCard className="w-5 h-5 text-primary" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1>Payment Methods</h1>
        <p className="text-muted-foreground mt-2">
          Track spending across different payment methods
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payment Methods
            </CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{paymentMethods.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              active payment methods
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Monthly Spend
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">${totalMonthlySpend.toFixed(0)}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <p className="text-xs text-muted-foreground">
                across {totalActive} active subscriptions
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Highest Spending Method
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              ${paymentStats[0]?.monthlySpend.toFixed(0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentStats[0]?.method || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentStats.map((stat) => (
          <Card key={stat.method}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {getPaymentIcon(stat.method)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base">{stat.method}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stat.total} linked subscription{stat.total !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-semibold">${stat.monthlySpend.toFixed(0)}</div>
                  <p className="text-xs text-muted-foreground mt-1">per month</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="flex items-center gap-6 pb-4 border-b border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  <p className="text-xl font-semibold mt-1">{stat.active}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                  <p className="text-xl font-semibold mt-1">{stat.total}</p>
                </div>
                {stat.monthlySpend > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Yearly Projection</p>
                    <p className="text-xl font-semibold mt-1">
                      ${(stat.monthlySpend * 12).toFixed(0)}
                    </p>
                  </div>
                )}
              </div>

              {/* Subscriptions */}
              <div>
                <p className="text-sm font-medium mb-3">Subscriptions using this payment method:</p>
                <div className="space-y-2">
                  {stat.subscriptions.map((sub) => (
                    <Link key={sub.id} to={`/subscription/${sub.id}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{sub.toolName}</h4>
                          <p className="text-xs text-muted-foreground">{sub.category}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          {sub.price > 0 && (
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-medium">${sub.price}</p>
                              <p className="text-xs text-muted-foreground">
                                {sub.billingCycle || 'trial'}
                              </p>
                            </div>
                          )}
                          <Badge
                            variant={
                              sub.status === 'active' ? 'default' :
                              sub.status === 'trial' ? 'secondary' :
                              'destructive'
                            }
                          >
                            {sub.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
