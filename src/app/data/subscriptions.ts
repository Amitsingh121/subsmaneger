export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type PaymentMethod = 'Credit Card' | 'Debit Card' | 'PayPal' | 'UPI' | 'Virtual Card';

export interface Subscription {
  id: string;
  toolName: string;
  website: string;
  category: string;
  purpose: string;
  status: SubscriptionStatus;
  email: string;
  trialStartDate?: string;
  trialEndDate?: string;
  billingCycle?: 'monthly' | 'yearly' | 'one-time';
  price: number;
  currency: string;
  paymentMethod: PaymentMethod;
  reminderDays: number;
  tags: string[];
  notes: string;
  lastUsed?: string;
  user_id?: string;
}

export const mockSubscriptions: Subscription[] = [];

export const getUniqueEmails = (): string[] => {
  return Array.from(new Set(mockSubscriptions.map(s => s.email)));
};

export const getUniquePaymentMethods = (): PaymentMethod[] => {
  return Array.from(new Set(mockSubscriptions.map(s => s.paymentMethod)));
};

export const getDuplicateTools = () => {
  const toolCounts = mockSubscriptions.reduce((acc, sub) => {
    acc[sub.toolName] = (acc[sub.toolName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(toolCounts)
    .filter(([_, count]) => count > 1)
    .map(([toolName, count]) => ({
      toolName,
      count,
      subscriptions: mockSubscriptions.filter(s => s.toolName === toolName)
    }));
};
