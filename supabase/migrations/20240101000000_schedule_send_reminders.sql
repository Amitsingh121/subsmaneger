-- =============================================================================
-- Migration: Schedule daily subscription reminder emails via pg_cron
-- =============================================================================
--
-- This migration sets up a daily cron job that invokes the `send-reminders`
-- Supabase Edge Function at 08:00 UTC every day. The edge function queries
-- subscriptions nearing expiry and sends reminder emails via Resend.
--
-- HOW IT WORKS:
--   1. Enables the `pg_cron` extension (scheduling) and `pg_net` extension
--      (HTTP requests from within PostgreSQL).
--   2. Registers a cron job named 'send-subscription-reminders' that fires
--      daily at 08:00 UTC.
--   3. The job uses `net.http_post` to make an HTTP POST request to the
--      edge function endpoint, passing the service role key for authorization.
--
-- HOW TO MODIFY THE SCHEDULE:
--   The cron expression '0 8 * * *' means "at minute 0 of hour 8, every day."
--   Common alternatives:
--     '0 9 * * *'    — Run daily at 09:00 UTC
--     '0 8,20 * * *' — Run twice daily at 08:00 and 20:00 UTC
--     '0 */6 * * *'  — Run every 6 hours
--     '30 7 * * 1-5' — Run at 07:30 UTC on weekdays only
--
--   To update the schedule after deployment, run:
--     SELECT cron.unschedule('send-subscription-reminders');
--   Then re-run this migration with the new cron expression, or call:
--     SELECT cron.schedule('send-subscription-reminders', '<new expression>', $$ ... $$);
--
-- ENVIRONMENT VARIABLES REQUIRED:
--   These are referenced as current_setting() calls below. They must be set
--   as Supabase project secrets / vault entries:
--     - SUPABASE_URL: Your project's API URL (e.g., https://xyz.supabase.co)
--     - SUPABASE_SERVICE_ROLE_KEY: The service role key for authorization
--
-- =============================================================================

-- Enable required extensions (idempotent — safe to run multiple times)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the send-reminders edge function to run daily at 08:00 UTC
SELECT cron.schedule(
  'send-subscription-reminders',  -- unique job name
  '0 8 * * *',                    -- cron expression: daily at 08:00 UTC
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);
