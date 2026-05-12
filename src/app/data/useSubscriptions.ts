import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Subscription } from './subscriptions';

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const fetchSubscriptions = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch subscriptions:', error);
      } else if (data) {
        // Normalize snake_case DB columns to camelCase for the app
        const normalized = data.map((row: any) => ({
          id: row.id,
          toolName: row.tool_name,
          website: row.website,
          category: row.category,
          purpose: row.purpose,
          status: row.status,
          email: row.email,
          trialStartDate: row.trial_start_date,
          trialEndDate: row.trial_end_date,
          billingCycle: row.billing_cycle,
          price: row.price,
          currency: row.currency,
          paymentMethod: row.payment_method,
          reminderDays: row.reminder_days,
          tags: row.tags ?? [],
          notes: row.notes,
          lastUsed: row.last_used,
          user_id: row.user_id,
        }));
        setSubscriptions(normalized as Subscription[]);
      }
      setLoading(false);
    };

    fetchSubscriptions();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('subscriptions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` },
        () => fetchSubscriptions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { subscriptions, loading };
}