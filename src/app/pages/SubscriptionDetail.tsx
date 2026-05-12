import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSubscriptions } from '../data/useSubscriptions';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  CreditCard,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  AlertTriangle,
  Edit,
  Save,
  X,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';

export function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subscriptions, loading } = useSubscriptions();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const subscription = subscriptions.find(s => s.id === id);

  // All subscriptions with the same tool name (siblings)
  const siblings = subscription
    ? subscriptions.filter(s => s.toolName === subscription.toolName && s.id !== subscription.id)
    : [];

  // Edit form state
  const [editData, setEditData] = useState<Record<string, string>>({});

  const startEditing = () => {
    if (!subscription) return;
    setEditData({
      email: subscription.email,
      price: String(subscription.price),
      billingCycle: subscription.billingCycle ?? '',
      paymentMethod: subscription.paymentMethod,
      status: subscription.status,
      category: subscription.category,
      purpose: subscription.purpose,
      trialStartDate: subscription.trialStartDate ?? '',
      trialEndDate: subscription.trialEndDate ?? '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    if (!subscription) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          email: editData.email,
          price: parseFloat(editData.price) || 0,
          billing_cycle: editData.billingCycle || null,
          payment_method: editData.paymentMethod,
          status: editData.status,
          category: editData.category,
          purpose: editData.purpose,
          trial_start_date: editData.trialStartDate ? new Date(editData.trialStartDate).toISOString() : null,
          trial_end_date: editData.trialEndDate ? new Date(editData.trialEndDate).toISOString() : null,
        })
        .eq('id', subscription.id);

      if (error) {
        toast.error(`Update failed: ${error.message || 'Unknown error'}`);
        return;
      }
      toast.success('Subscription updated!');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!subscription) return;
    if (!confirm(`Delete "${subscription.toolName}" (${subscription.email})? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscription.id);

      if (error) {
        toast.error(`Delete failed: ${error.message}`);
        return;
      }
      toast.success('Subscription deleted.');
      navigate('/subscriptions');
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-semibold">Subscription Not Found</h1>
        <p className="text-muted-foreground mt-4">This subscription doesn't exist or was deleted.</p>
        <Link to="/subscriptions">
          <Button className="mt-6">Back to Subscriptions</Button>
        </Link>
      </div>
    );
  }

  const daysUntilExpiry = subscription.trialEndDate
    ? differenceInDays(parseISO(subscription.trialEndDate), new Date())
    : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-semibold">{subscription.toolName}</h1>
              <Badge
                variant="outline"
                className={cn(
                  'rounded-full text-xs',
                  subscription.status === 'active' && 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500',
                  subscription.status === 'trial' && 'border-amber-500/40 bg-amber-500/10 text-amber-500',
                  subscription.status === 'expired' && 'border-rose-500/40 bg-rose-500/10 text-rose-500',
                  subscription.status === 'cancelled' && 'border-slate-500/40 bg-slate-500/10 text-slate-500',
                )}
              >
                {subscription.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{subscription.purpose}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={startEditing}>
                <Edit className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} disabled={isDeleting}
                className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10">
                <Trash2 className="w-4 h-4 mr-2" /> {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleSave} disabled={isSaving}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500">
                <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={cancelEditing}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Duplicate Warning */}
      {siblings.length > 0 && (
        <Alert className="border-orange-500/30 bg-orange-500/5">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm">
            You have <span className="font-semibold">{siblings.length + 1} subscriptions</span> to {subscription.toolName} using different accounts.{' '}
            <Link to="/alerts" className="underline text-orange-500 hover:text-orange-400">View all duplicates</Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Trial Expiry Warning */}
      {subscription.status === 'trial' && daysUntilExpiry !== null && daysUntilExpiry <= 7 && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <Clock className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            Trial expires {daysUntilExpiry === 0 ? 'today' : daysUntilExpiry === 1 ? 'tomorrow' : `in ${daysUntilExpiry} days`}
            {subscription.trialEndDate && ` — ${format(parseISO(subscription.trialEndDate), 'MMMM d, yyyy')}`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Edit form or Overview */}
          {isEditing ? (
            <Card>
              <CardHeader><CardTitle className="text-base">Edit Subscription</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={editData.email} onChange={e => setEditData(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={editData.status} onValueChange={v => setEditData(p => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Input value={editData.purpose} onChange={e => setEditData(p => ({ ...p, purpose: e.target.value }))} />
                </div>

                {/* Date editing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trial Start Date</Label>
                    <Input
                      type="date"
                      value={editData.trialStartDate ? editData.trialStartDate.split('T')[0] : ''}
                      onChange={e => setEditData(p => ({ ...p, trialStartDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trial End Date</Label>
                    <Input
                      type="date"
                      value={editData.trialEndDate ? editData.trialEndDate.split('T')[0] : ''}
                      onChange={e => setEditData(p => ({ ...p, trialEndDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input type="number" step="0.01" value={editData.price} onChange={e => setEditData(p => ({ ...p, price: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Cycle</Label>
                    <Select value={editData.billingCycle} onValueChange={v => setEditData(p => ({ ...p, billingCycle: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={editData.paymentMethod} onValueChange={v => setEditData(p => ({ ...p, paymentMethod: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="PayPal">PayPal</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Virtual Card">Virtual Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editData.category} onChange={e => setEditData(p => ({ ...p, category: e.target.value }))} />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base">Overview</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Category</p>
                    <Badge variant="outline">{subscription.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge variant="outline">{subscription.status}</Badge>
                  </div>
                </div>

                {/* Login method — read from stored value, never infer from email domain */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Login Method</p>
                  <div className="flex items-center gap-2">
                    {(subscription.loginMethod === 'google') && (
                      <Badge variant="outline" className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border-blue-500/30 text-blue-500">
                        <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        Google
                      </Badge>
                    )}
                    {(subscription.loginMethod === 'github') && (
                      <Badge variant="outline" className="flex items-center gap-1.5 rounded-full bg-slate-500/10 border-slate-500/30 text-slate-400">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                        GitHub
                      </Badge>
                    )}
                    {(subscription.loginMethod === 'microsoft') && (
                      <Badge variant="outline" className="flex items-center gap-1.5 rounded-full bg-blue-500/10 border-blue-500/30 text-blue-400">
                        <svg viewBox="0 0 24 24" className="w-3 h-3"><path fill="#F25022" d="M1 1h10v10H1z"/><path fill="#00A4EF" d="M13 1h10v10H13z"/><path fill="#7FBA00" d="M1 13h10v10H1z"/><path fill="#FFB900" d="M13 13h10v10H13z"/></svg>
                        Microsoft
                      </Badge>
                    )}
                    {(subscription.loginMethod === 'apple') && (
                      <Badge variant="outline" className="flex items-center gap-1.5 rounded-full bg-slate-500/10 border-slate-500/30 text-slate-400">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        Apple
                      </Badge>
                    )}
                    {/* Default: show Email / Password for 'email' or any unrecognised value */}
                    {(!subscription.loginMethod || subscription.loginMethod === 'email') && (
                      <Badge variant="outline" className="flex items-center gap-1.5 rounded-full bg-violet-500/10 border-violet-500/30 text-violet-400">
                        <Mail className="w-3 h-3" />
                        Email / Password
                      </Badge>
                    )}
                  </div>
                </div>

                {subscription.website && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                    <a href={subscription.website} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1">
                      {subscription.website} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Trial Timeline */}
          {subscription.trialStartDate && subscription.trialEndDate && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" /> Trial Timeline</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start</span>
                  <span className="text-sm font-medium">{format(parseISO(subscription.trialStartDate), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End</span>
                  <span className="text-sm font-medium">{format(parseISO(subscription.trialEndDate), 'MMM d, yyyy')}</span>
                </div>
                {daysUntilExpiry !== null && (
                  <div className="pt-2 border-t border-border">
                    <p className={cn('text-sm font-medium',
                      daysUntilExpiry > 0 ? 'text-emerald-500' : 'text-rose-400',
                    )}>
                      {daysUntilExpiry > 0 ? `${daysUntilExpiry} days remaining` : daysUntilExpiry === 0 ? 'Expires today' : `Expired ${Math.abs(daysUntilExpiry)} days ago`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Other subscriptions for same tool */}
          {siblings.length > 0 && (
            <Card className="border-orange-500/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Other "{subscription.toolName}" Accounts ({siblings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {siblings.map(sib => (
                  <Link key={sib.id} to={`/subscription/${sib.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sib.email}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] rounded-full px-2 py-0">{sib.status}</Badge>
                        {sib.price > 0 && <span className="text-xs text-muted-foreground">${sib.price}/{sib.billingCycle ?? 'mo'}</span>}
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {subscription.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{subscription.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Billing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Billing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscription.price > 0 && (
                <>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold mt-1">${subscription.price}</p>
                  </div>
                  {subscription.billingCycle && (
                    <div>
                      <p className="text-xs text-muted-foreground">Cycle</p>
                      <p className="text-sm capitalize mt-0.5">{subscription.billingCycle}</p>
                    </div>
                  )}
                  <Separator />
                </>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Payment Method</p>
                {subscription.paymentMethod ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{subscription.paymentMethod}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2"><Mail className="w-4 h-4" /> Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm mt-0.5 break-all">{subscription.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reminder</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm">{subscription.reminderDays} days before</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {subscription.tags && subscription.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Tag className="w-4 h-4" /> Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {subscription.tags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="rounded-full text-xs bg-primary/10 border-primary/30 text-primary">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
