import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSubscriptions } from '../data/useSubscriptions';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { ToolIcon } from '../components/ToolIcon';

export function Subscriptions() {
  const { subscriptions, loading } = useSubscriptions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [emailFilter, setEmailFilter] = useState<string>('all');

  const categories = Array.from(new Set(subscriptions.map(s => s.category)));
  const emails = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const sub of subscriptions) {
      if (!sub.email) continue;
      const normalized = sub.email.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(sub.email);
      }
    }
    return result;
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchesSearch =
        sub.toolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.email ? sub.email.toLowerCase().includes(searchQuery.toLowerCase()) : false);

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || sub.category === categoryFilter;
      const matchesEmail = emailFilter === 'all' || (sub.email ? sub.email.toLowerCase() === emailFilter.toLowerCase() : false);

      return matchesSearch && matchesStatus && matchesCategory && matchesEmail;
    });
  }, [subscriptions, searchQuery, statusFilter, categoryFilter, emailFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string; label: string }> = {
      active: {
        className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0',
        label: 'Active'
      },
      trial: {
        className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0',
        label: 'Trial'
      },
      expired: {
        className: 'bg-gradient-to-r from-red-500 to-rose-500 text-white border-0',
        label: 'Expired'
      },
      cancelled: {
        className: 'bg-gradient-to-r from-slate-400 to-gray-400 text-white border-0',
        label: 'Cancelled'
      },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <motion.div
        whileHover={{ scale: 1.1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-block"
      >
        <Badge className={config.className}>{config.label}</Badge>
      </motion.div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all your software subscriptions and trials
          </p>
        </div>
        <Link to="/add" className="lg:hidden">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border-indigo-200/50 dark:border-indigo-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Filter className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Filters
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <motion.div
              animate={{ scale: searchQuery ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
              className="absolute left-3 top-1/2 -translate-y-1/2"
            >
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </motion.div>
            <Input
              placeholder="Search by tool name, purpose, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400 dark:focus:border-indigo-600"
            />
          </div>

          {/* Filter Selects */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm mb-2 block">Email Account</label>
              <Select value={emailFilter} onValueChange={setEmailFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All emails" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Emails</SelectItem>
                  {emails.map(email => (
                    <SelectItem key={email} value={email}>{email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={filteredSubscriptions.length}
              className="text-sm text-muted-foreground"
            >
              Showing <span className="font-semibold text-indigo-600 dark:text-indigo-400">{filteredSubscriptions.length}</span> of {subscriptions.length} subscriptions
            </motion.p>
            {(searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || emailFilter !== 'all') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                    setEmailFilter('all');
                  }}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Subscriptions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading subscriptions...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {emailFilter !== 'all'
                        ? 'No subscriptions found for this email'
                        : 'No subscriptions found matching your filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((sub, index) => (
                    <motion.tr
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)", scale: 1.005 }}
                      className="border-b"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <ToolIcon toolName={sub.toolName} website={sub.website} size="md" />
                          <div>
                            <div className="font-medium">{sub.toolName}</div>
                            <div className="text-sm text-muted-foreground">{sub.purpose}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 2 }}
                          className="inline-block"
                        >
                          <Badge
                            variant="outline"
                            className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border-cyan-300 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300"
                          >
                            {sub.category}
                          </Badge>
                        </motion.div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">
                        {sub.email}
                      </TableCell>
                      <TableCell>
                        {sub.trialEndDate ? (
                          <div>
                            <div className="text-sm">{format(parseISO(sub.trialEndDate), 'MMM d, yyyy')}</div>
                            <div className="text-xs text-muted-foreground">Trial end</div>
                          </div>
                        ) : sub.billingCycle ? (
                          <div className="text-sm text-muted-foreground">
                            {sub.billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">-</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {sub.price > 0 && (
                          <div>
                            <div className="font-medium">${sub.price}</div>
                            <div className="text-xs text-muted-foreground">
                              {sub.billingCycle || 'trial'}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{sub.paymentMethod}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/subscription/${sub.id}`}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="ghost" size="sm" className="hover:bg-indigo-100 dark:hover:bg-indigo-900/20">View</Button>
                          </motion.div>
                        </Link>
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
