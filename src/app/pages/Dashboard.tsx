import { Link } from 'react-router-dom';
import { useSubscriptions } from '../data/useSubscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  AlertCircle,
  ArrowRight,
  Search,
  Bell,
  ChevronDown,
  List,
  MoreHorizontal,
  DollarSign,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { ToolIcon } from '../components/ToolIcon';

export function Dashboard() {
  const { subscriptions, loading } = useSubscriptions();
  const { user } = useAuth();

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const trialSubscriptions = subscriptions.filter(s => s.status === 'trial');
  const duplicateMap = subscriptions.reduce((acc, sub) => {
    acc[sub.toolName] = (acc[sub.toolName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const duplicates = Object.entries(duplicateMap).filter(([, count]) => count > 1);

  const monthlySpend = activeSubscriptions.reduce((sum, sub) => {
    if (sub.billingCycle === 'monthly') return sum + sub.price;
    if (sub.billingCycle === 'yearly') return sum + sub.price / 12;
    return sum;
  }, 0);

  const trialsEndingSoon = trialSubscriptions
    .filter(s => {
      if (!s.trialEndDate) return false;
      const daysUntilEnd = differenceInDays(parseISO(s.trialEndDate), new Date());
      return daysUntilEnd <= 7 && daysUntilEnd >= 0;
    })
    .sort((a, b) => {
      if (!a.trialEndDate || !b.trialEndDate) return 0;
      return parseISO(a.trialEndDate).getTime() - parseISO(b.trialEndDate).getTime();
    });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string; dot: string }> = {
      active: {
        className: 'bg-emerald-50 dark:bg-black/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30',
        dot: 'bg-emerald-500',
        label: 'Active'
      },
      trial: {
        className: 'bg-amber-50 dark:bg-black/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30',
        dot: 'bg-amber-500',
        label: 'Trial'
      },
      expired: {
        className: 'bg-rose-50 dark:bg-black/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30',
        dot: 'bg-rose-500',
        label: 'Expired'
      },
      cancelled: {
        className: 'bg-slate-50 dark:bg-black/50 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800/50',
        dot: 'bg-slate-500',
        label: 'Cancelled'
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge variant="outline" className={`rounded-full px-2.5 py-0.5 flex items-center gap-1.5 w-fit font-medium ${config.className}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track all your subscriptions, payments, and upcoming renewals
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search subscriptions..." 
              className="bg-card border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 w-64 text-foreground placeholder:text-muted-foreground transition-all"
            />
          </div>
          <button className="relative p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background shadow-sm shadow-violet-500/50">
              {trialsEndingSoon.length || 0}
            </span>
          </button>
          <div className="flex items-center gap-3 pl-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center overflow-hidden border-2 border-card">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}&backgroundColor=transparent`} alt={user?.email ?? ''} className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-foreground">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground hidden md:block" />
          </div>
        </div>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-muted-foreground text-sm">Loading subscriptions...</span>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -4 }}
          className="relative"
        >
          <Card className="dark:bg-[#131A2A] bg-white border-emerald-200 dark:border-emerald-500/20 shadow-lg shadow-emerald-500/5 dark:shadow-emerald-500/10 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/25 shadow-inner shadow-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <CardTitle className="text-sm font-medium text-foreground">
                  Active Subscriptions
                </CardTitle>
              </div>
              <div className="text-4xl font-bold text-foreground mb-4">
                {activeSubscriptions.length}
              </div>
              <div className="flex items-end justify-between mt-auto">
                <p className="text-xs font-medium text-emerald-400">
                  +2 from last month
                </p>
                <svg width="60" height="20" viewBox="0 0 60 20" className="stroke-emerald-400 fill-none" strokeWidth="1.5">
                  <path d="M0 15 L10 12 L20 16 L30 8 L40 10 L50 4 L60 6" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -4 }}
          className="relative"
        >
          <Card className="dark:bg-[#131A2A] bg-white border-indigo-200 dark:border-indigo-500/20 shadow-lg shadow-indigo-500/5 dark:shadow-indigo-500/10 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center border border-indigo-500/25 shadow-inner shadow-indigo-500/10">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                </div>
                <CardTitle className="text-sm font-medium text-foreground">
                  Monthly Spend
                </CardTitle>
              </div>
              <div className="text-4xl font-bold text-foreground mb-4">
                ${monthlySpend.toFixed(2)}
              </div>
              <div className="flex items-end justify-between mt-auto">
                <p className="text-xs font-medium text-emerald-400">
                  +8.4% from last month
                </p>
                <svg width="60" height="20" viewBox="0 0 60 20" className="stroke-indigo-400 fill-none" strokeWidth="1.5">
                  <path d="M0 15 L10 10 L20 14 L30 6 L40 12 L50 2 L60 4" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -4 }}
          className="relative"
        >
          <Card className="dark:bg-[#131A2A] bg-white border-amber-200 dark:border-amber-500/20 shadow-lg shadow-amber-500/5 dark:shadow-amber-500/10 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/25 shadow-inner shadow-amber-500/10">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <CardTitle className="text-sm font-medium text-foreground">
                  Trials Ending Soon
                </CardTitle>
              </div>
              <div className="text-4xl font-bold text-foreground mb-4">
                {trialsEndingSoon.length}
              </div>
              <div className="flex items-end justify-between mt-auto">
                <p className="text-xs font-medium text-amber-400">
                  within next 7 days
                </p>
                <svg width="60" height="20" viewBox="0 0 60 20" className="stroke-amber-400 fill-none" strokeWidth="1.5">
                  <path d="M0 16 L10 12 L20 18 L30 10 L40 14 L50 6 L60 8" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -4 }}
          className="relative"
        >
          <Card className="dark:bg-[#131A2A] bg-white border-rose-200 dark:border-rose-500/20 shadow-lg shadow-rose-500/5 dark:shadow-rose-500/10 h-full">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center border border-rose-500/25 shadow-inner shadow-rose-500/10">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <CardTitle className="text-sm font-medium text-foreground">
                  Duplicate Trials
                </CardTitle>
              </div>
              <div className="text-4xl font-bold text-foreground mb-4">
                {duplicates.length}
              </div>
              <div className="flex items-end justify-between mt-auto">
                <p className="text-xs font-medium text-rose-400">
                  across 2 accounts
                </p>
                <svg width="60" height="20" viewBox="0 0 60 20" className="stroke-rose-400 fill-none" strokeWidth="1.5">
                  <path d="M0 12 L10 16 L20 8 L30 14 L40 4 L50 10 L60 2" />
                </svg>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      )}

      {/* Trials Ending Soon */}
      {!loading && trialsEndingSoon.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-orange-200/50 dark:border-orange-800/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </motion.div>
                  Trials Ending Soon
                </CardTitle>
                <Link to="/calendar">
                  <Button variant="ghost" size="sm" className="hover:bg-orange-100 dark:hover:bg-orange-900/20">
                    View Calendar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trialsEndingSoon.map((sub, index) => {
                  const daysLeft = sub.trialEndDate
                    ? differenceInDays(parseISO(sub.trialEndDate), new Date())
                    : 0;
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(251, 146, 60, 0.05)" }}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-lg border border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-orange-50/30 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/20"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">{sub.toolName}</h4>
                        <p className="text-sm text-orange-700/70 dark:text-orange-300/70 break-all">{sub.email}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="text-left sm:text-right">
                          <motion.p
                            className="text-sm font-medium text-orange-700 dark:text-orange-300"
                            animate={daysLeft <= 1 ? { scale: [1, 1.1, 1] } : {}}
                            transition={daysLeft <= 1 ? { duration: 1.5, repeat: Infinity } : {}}
                          >
                            {daysLeft === 0 ? 'Today' : daysLeft === 1 ? 'Tomorrow' : `${daysLeft} days`}
                          </motion.p>
                          <p className="text-xs text-orange-600/60 dark:text-orange-400/60">
                            {sub.trialEndDate && format(parseISO(sub.trialEndDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <Link to={`/subscription/${sub.id}`}>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline" size="sm" className="border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30">View</Button>
                          </motion.div>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Subscriptions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card className="dark:bg-[#131625] bg-white border-gray-200 dark:border-white/[0.06] shadow-lg shadow-gray-200/50 dark:shadow-black/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-foreground flex items-center gap-2">
                <List className="w-5 h-5 text-indigo-400" />
                All Subscriptions
              </CardTitle>
              <Link to="/subscriptions">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-white/5 transition-all">
                  <span className="hidden sm:inline mr-2 text-xs">View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 dark:border-white/5 hover:bg-transparent">
                  <TableHead className="text-xs font-normal text-muted-foreground pl-6">Tool</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Category</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Status</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Email</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Cost</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Payment Method</TableHead>
                  <TableHead className="text-xs font-normal text-muted-foreground">Renewal Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <List className="w-8 h-8 opacity-30" />
                        <p>No subscriptions yet.</p>
                        <Link to="/add" className="text-primary text-sm hover:underline">Add your first one →</Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.slice(0, 8).map((sub, index) => (
                  <motion.tr
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                    className="border-b border-gray-100 dark:border-white/5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <ToolIcon toolName={sub.toolName} website={sub.website} size="md" />
                        <span className="font-medium text-sm text-foreground">{sub.toolName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 font-normal rounded-full"
                      >
                        {sub.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{sub.email}</TableCell>
                    <TableCell>
                      {sub.price > 0 && (
                        <span className="text-sm text-foreground">
                          ${sub.price} <span className="text-muted-foreground text-xs">/{sub.billingCycle ?? 'mo'}</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                           <span className="text-[8px] text-white font-bold italic">VISA</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{sub.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <span className="text-sm text-foreground">
                            {sub.trialEndDate
                              ? format(parseISO(sub.trialEndDate), 'MMM d, yyyy')
                              : '—'}
                          </span>
                          {sub.status === 'trial' && sub.trialEndDate && (
                             <Badge className="bg-amber-500/20 text-amber-500 border-0 text-[10px] rounded hover:bg-amber-500/30">
                               {differenceInDays(parseISO(sub.trialEndDate), new Date())}d
                             </Badge>
                          )}
                          <button className="text-muted-foreground hover:text-foreground ml-auto">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                       </div>
                    </TableCell>
                  </motion.tr>
                ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
