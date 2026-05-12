import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Save,
  CalendarIcon,
  X,
  CreditCard,
  Wallet,
  Smartphone,
  Globe,
  ChevronDown,
  Plus,
  Copy,
  Trash2,
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '../components/ui/utils';
import { toast } from 'sonner';

// ── Date Picker component ────────────────────────────────────────────────────
function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: (date: Date) => boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background text-sm text-left transition-colors hover:bg-accent',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-60" />
          <span className="flex-1">{value ? format(value, 'PPP') : placeholder}</span>
          {value && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 z-[9999]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => {
          // Only close if clicking truly outside
          const target = e.target as HTMLElement;
          if (target.closest('[data-slot="popover-content"]')) {
            e.preventDefault();
          }
        }}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={(d) => {
            onChange(d);
            setOpen(false);
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}

// ── OAuth provider config (UI only — no redirects) ───────────────────────────
const OAUTH_PROVIDERS = [
  {
    id: 'google',
    label: 'Google',
    placeholder: 'yourname@gmail.com',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    placeholder: 'github-username',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" aria-hidden>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'microsoft',
    label: 'Microsoft',
    placeholder: 'yourname@outlook.com',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden>
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#00A4EF" d="M13 1h10v10H13z" />
        <path fill="#7FBA00" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple',
    placeholder: 'yourname@icloud.com',
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 fill-current" aria-hidden>
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
] as const;

type OAuthProviderId = typeof OAUTH_PROVIDERS[number]['id'];

interface LinkedAccount {
  provider: OAuthProviderId;
  accountId: string;
}

// ── Payment method config ────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { value: 'Credit Card', icon: <CreditCard className="w-4 h-4" />, label: 'Credit Card' },
  { value: 'Debit Card', icon: <CreditCard className="w-4 h-4" />, label: 'Debit Card' },
  { value: 'PayPal', icon: <Wallet className="w-4 h-4" />, label: 'PayPal' },
  { value: 'UPI', icon: <Smartphone className="w-4 h-4" />, label: 'UPI' },
  { value: 'Virtual Card', icon: <Globe className="w-4 h-4" />, label: 'Virtual Card' },
];

// ── Trial entry type ─────────────────────────────────────────────────────────
interface TrialEntry {
  id: string; // local key only
  email: string;
  password: string;
  paymentMethod: string;
  trialStartDate: Date | undefined;
  trialEndDate: Date | undefined;
  billingCycle: string;
  price: string;
  currency: string;
  reminderDays: string;
  // account provider tracking
  selectedProvider: OAuthProviderId | null;
  accountIdInput: string;
  linkedAccounts: LinkedAccount[];
}

function makeEmptyTrial(email = ''): TrialEntry {
  return {
    id: crypto.randomUUID(),
    email,
    password: '',
    paymentMethod: '',
    trialStartDate: undefined,
    trialEndDate: undefined,
    billingCycle: '',
    price: '',
    currency: 'USD',
    reminderDays: '3',
    selectedProvider: null,
    accountIdInput: '',
    linkedAccounts: [],
  };
}

// ── Trial row component ───────────────────────────────────────────────────────
function TrialRow({
  trial,
  index,
  total,
  onChange,
  onRemove,
  onDuplicate,
}: {
  trial: TrialEntry;
  index: number;
  total: number;
  onChange: (id: string, patch: Partial<TrialEntry>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const set = (patch: Partial<TrialEntry>) => onChange(trial.id, patch);

  const trialDuration =
    trial.trialStartDate && trial.trialEndDate
      ? Math.max(0, differenceInDays(trial.trialEndDate, trial.trialStartDate))
      : null;

  const handleAddLinkedAccount = () => {
    if (!trial.selectedProvider || !trial.accountIdInput.trim()) return;
    const already = trial.linkedAccounts.find(
      a => a.provider === trial.selectedProvider && a.accountId === trial.accountIdInput.trim(),
    );
    if (already) { toast.error('Already added.'); return; }
    const newAccounts = [...trial.linkedAccounts, { provider: trial.selectedProvider, accountId: trial.accountIdInput.trim() }];
    const autoEmail = trial.email || trial.accountIdInput.trim();
    set({ linkedAccounts: newAccounts, accountIdInput: '', selectedProvider: null, email: autoEmail });
  };

  return (
    <div className="relative rounded-xl border border-border bg-card/50 p-4 space-y-4">
      {/* Row header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-foreground">
            Trial #{index + 1}
            {trial.email && <span className="ml-2 text-muted-foreground font-normal">— {trial.email}</span>}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onDuplicate(trial.id)}
            title="Duplicate this trial"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {total > 1 && (
            <button
              type="button"
              onClick={() => onRemove(trial.id)}
              title="Remove this trial"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Account provider */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Account</Label>
        <div className="flex flex-wrap gap-2">
          {OAUTH_PROVIDERS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => set({ selectedProvider: trial.selectedProvider === p.id ? null : p.id, accountIdInput: '' })}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all',
                trial.selectedProvider === p.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {p.icon} {p.label}
              <ChevronDown className={cn('w-3 h-3 transition-transform', trial.selectedProvider === p.id ? 'rotate-180' : '')} />
            </button>
          ))}
        </div>

        {trial.selectedProvider && (
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 flex-1 bg-muted/40 border border-border rounded-lg px-3 py-2">
              {OAUTH_PROVIDERS.find(p => p.id === trial.selectedProvider)?.icon}
              <input
                type="text"
                autoFocus
                placeholder={OAUTH_PROVIDERS.find(p => p.id === trial.selectedProvider)?.placeholder}
                value={trial.accountIdInput}
                onChange={e => set({ accountIdInput: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddLinkedAccount())}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
              />
            </div>
            <Button type="button" size="sm" onClick={handleAddLinkedAccount} disabled={!trial.accountIdInput.trim()}>Add</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => set({ selectedProvider: null, accountIdInput: '' })} className="text-muted-foreground">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {trial.linkedAccounts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {trial.linkedAccounts.map((acc, i) => {
              const prov = OAUTH_PROVIDERS.find(p => p.id === acc.provider);
              return (
                <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs">
                  {prov?.icon} {acc.accountId}
                  <button type="button" onClick={() => set({ linkedAccounts: trial.linkedAccounts.filter((_, j) => j !== i) })} className="hover:text-rose-400">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <Label className="text-xs">Email *</Label>
            <Input
              type="email"
              placeholder="account@email.com"
              value={trial.email}
              onChange={e => set({ email: e.target.value })}
              required
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Password / Notes</Label>
            <Input
              placeholder="Password manager link"
              value={trial.password}
              onChange={e => set({ password: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Trial dates */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Trial Period</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Start Date</Label>
            <DatePicker
              value={trial.trialStartDate}
              onChange={d => set({ trialStartDate: d })}
              placeholder="Pick start date"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">End Date</Label>
            <DatePicker
              value={trial.trialEndDate}
              onChange={d => set({ trialEndDate: d })}
              placeholder="Pick end date"
              disabled={trial.trialStartDate ? (d) => d < trial.trialStartDate! : undefined}
            />
          </div>
        </div>
        {trialDuration !== null && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                trialDuration <= 3 ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                  : trialDuration <= 7 ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
              )}
            >
              {trialDuration} day trial
            </Badge>
            {trial.trialEndDate && trial.trialEndDate > new Date() && (
              <span className="text-xs text-muted-foreground">ends {format(trial.trialEndDate, 'MMM d, yyyy')}</span>
            )}
            {trial.trialEndDate && trial.trialEndDate <= new Date() && (
              <span className="text-xs text-rose-400">already ended</span>
            )}
          </div>
        )}
      </div>

      {/* Billing */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Billing</Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Cycle</Label>
            <Select value={trial.billingCycle} onValueChange={v => set({ billingCycle: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Cycle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price</Label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                {trial.currency === 'INR' ? '₹' : trial.currency === 'EUR' ? '€' : trial.currency === 'GBP' ? '£' : '$'}
              </span>
              <Input type="number" step="0.01" min="0" placeholder="0.00" className="pl-6 h-8 text-sm"
                value={trial.price} onChange={e => set({ price: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Currency</Label>
            <Select value={trial.currency} onValueChange={v => set({ currency: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">🇺🇸 USD</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR</SelectItem>
                <SelectItem value="GBP">🇬🇧 GBP</SelectItem>
                <SelectItem value="INR">🇮🇳 INR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Payment Method</Label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(pm => (
            <button
              key={pm.value}
              type="button"
              onClick={() => set({ paymentMethod: pm.value })}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                trial.paymentMethod === pm.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {pm.icon} {pm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reminder */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Remind Before Expiry</Label>
        <div className="flex flex-wrap gap-1.5">
          {['1', '3', '5', '7', '14', '30'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => set({ reminderDays: d })}
              className={cn(
                'px-2.5 py-1 rounded-full text-xs border transition-all',
                trial.reminderDays === d
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function AddSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Shared tool info
  const [formData, setFormData] = useState({
    toolName: '',
    website: '',
    purpose: '',
    category: '',
    customCategory: '',
    tags: '',
    notes: '',
  });

  // Multiple trial entries
  const [trials, setTrials] = useState<TrialEntry[]>([makeEmptyTrial()]);

  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const updateTrial = (id: string, patch: Partial<TrialEntry>) =>
    setTrials(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));

  const removeTrial = (id: string) =>
    setTrials(prev => prev.filter(t => t.id !== id));

  const duplicateTrial = (id: string) => {
    const src = trials.find(t => t.id === id);
    if (!src) return;
    const copy = { ...src, id: crypto.randomUUID(), email: '', linkedAccounts: [] };
    setTrials(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };

  const addTrial = () =>
    setTrials(prev => [...prev, makeEmptyTrial()]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!user) { toast.error('You must be logged in.'); return; }

    // Validate all trials have an email
    const missing = trials.findIndex(t => !t.email.trim());
    if (missing !== -1) {
      toast.error(`Trial #${missing + 1} is missing an email.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const finalCategory = formData.category === 'new' ? formData.customCategory : formData.category;

      const payloads = trials.map(trial => {
        let status = 'active';
        if (trial.trialEndDate) {
          status = trial.trialEndDate > new Date() ? 'trial' : trial.billingCycle ? 'active' : 'expired';
        }
        return {
          user_id: user.id,
          tool_name: formData.toolName,
          website: formData.website || null,
          purpose: formData.purpose,
          category: finalCategory || 'Other',
          status,
          trial_start_date: trial.trialStartDate?.toISOString() ?? null,
          trial_end_date: trial.trialEndDate?.toISOString() ?? null,
          billing_cycle: trial.billingCycle || null,
          price: parseFloat(trial.price) || 0,
          currency: trial.currency,
          email: trial.email,
          payment_method: trial.paymentMethod || 'Credit Card',
          reminder_days: parseInt(trial.reminderDays) || 3,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          notes: [formData.notes, trial.password ? `Password Link: ${trial.password}` : ''].filter(Boolean).join('\n') || null,
        };
      });

      const { error } = await supabase.from('subscriptions').insert(payloads);

      if (error) {
        console.error('Insert error:', JSON.stringify(error, null, 2));
        const msg = error.message ?? (error as any).details ?? (error as any).hint ?? error.code ?? 'Unknown error';
        toast.error(`Save failed: ${msg}`);
        return;
      }

      toast.success(
        payloads.length === 1
          ? 'Subscription saved!'
          : `${payloads.length} trials saved!`,
      );
      setTimeout(() => navigate('/subscriptions'), 500);
    } catch (err: any) {
      toast.error(err.message || 'Unexpected error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0 mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Add Subscription</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Add one tool with multiple trial accounts in one go
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Tool Info (shared across all trials) ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tool Information</CardTitle>
            <CardDescription>Shared across all trial entries below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="toolName">Tool Name *</Label>
                <Input id="toolName" placeholder="e.g., GitHub Copilot"
                  value={formData.toolName} onChange={e => handleChange('toolName', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" type="url" placeholder="https://..."
                  value={formData.website} onChange={e => handleChange('website', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose / Use Case *</Label>
              <Input id="purpose" placeholder="What do you use this tool for?"
                value={formData.purpose} onChange={e => handleChange('purpose', e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={v => handleChange('category', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {['Development','Design','Productivity','Project Management','Database',
                    'Deployment','Monitoring','Communication','AI/ML','API Testing','Email'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="new">Other (Add new)</SelectItem>
                </SelectContent>
              </Select>
              {formData.category === 'new' && (
                <Input className="mt-2" placeholder="Enter new category name"
                  onChange={e => handleChange('customCategory', e.target.value)} required />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" placeholder="AI, Coding, Testing"
                  value={formData.tags} onChange={e => handleChange('tags', e.target.value)} />
                {formData.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <Badge key={tag} variant="outline" className="rounded-full text-xs bg-primary/10 border-primary/30 text-primary">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Any additional notes..."
                  value={formData.notes} onChange={e => handleChange('notes', e.target.value)} rows={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Trial Entries ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Trial Accounts</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Each entry = one account ID. Add as many as you want.
              </p>
            </div>
            <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/10 text-primary text-xs">
              {trials.length} {trials.length === 1 ? 'trial' : 'trials'}
            </Badge>
          </div>

          {trials.map((trial, index) => (
            <TrialRow
              key={trial.id}
              trial={trial}
              index={index}
              total={trials.length}
              onChange={updateTrial}
              onRemove={removeTrial}
              onDuplicate={duplicateTrial}
            />
          ))}

          {/* Add trial button */}
          <button
            type="button"
            onClick={addTrial}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Another Trial Account
          </button>
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center justify-between gap-3 pb-4">
          <p className="text-xs text-muted-foreground">
            Will save <span className="font-semibold text-foreground">{trials.length}</span> subscription{trials.length > 1 ? 's' : ''} to your account
          </p>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30 min-w-[160px]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : `Save ${trials.length > 1 ? `${trials.length} Trials` : 'Subscription'}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}