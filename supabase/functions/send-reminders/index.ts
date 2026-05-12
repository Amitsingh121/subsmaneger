import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://subtrack.app";
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "SubTrack <reminders@subtrack.app>";

serve(async (_req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query subscriptions with status "active" or "trial" that have a trialEndDate
    // within the next 30 days (max reasonable reminder window).
    // We filter per-subscription based on each record's `reminderDays` value in code.
    const now = new Date();
    const maxWindow = new Date();
    maxWindow.setDate(maxWindow.getDate() + 30);

    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .in("status", ["active", "trial"])
      .gte("trial_end_date", now.toISOString())
      .lte("trial_end_date", maxWindow.toISOString());

    if (error) {
      throw error;
    }

    let emailsSent = 0;
    const failures: Array<{ id: string; email: string; error: string }> = [];

    for (const sub of subscriptions ?? []) {
      // Skip subscriptions with missing or empty email
      if (!sub.email || sub.email.trim() === "") {
        console.log(`Skipping subscription ${sub.id} (${sub.tool_name}): no email`);
        continue;
      }

      // Check if trial_end_date is within this subscription's reminder_days window
      const trialEnd = new Date(sub.trial_end_date);
      const reminderDays = sub.reminder_days ?? 3;
      const reminderThreshold = new Date();
      reminderThreshold.setDate(reminderThreshold.getDate() + reminderDays);

      // Only send if trial_end_date is between now and now + reminder_days
      if (trialEnd > reminderThreshold) {
        continue;
      }

      // Format the trial end date for display
      const formattedDate = trialEnd.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Build professional email HTML
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <h1 style="color: #18181b; font-size: 24px; margin: 0 0 8px 0;">Subscription Reminder</h1>
      <p style="color: #71717a; font-size: 14px; margin: 0 0 24px 0;">from SubTrack</p>
      
      <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
        <p style="color: #92400e; margin: 0; font-weight: 600;">⚠️ Your subscription is expiring soon</p>
      </div>
      
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        Hi there,
      </p>
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        Your subscription for <strong>${sub.tool_name}</strong> is expiring on <strong>${formattedDate}</strong>.
      </p>
      <p style="color: #3f3f46; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Please review your plan and decide whether to renew or cancel before the deadline.
      </p>
      
      <a href="${APP_URL}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px;">
        View in SubTrack
      </a>
      
      <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0 16px 0;">
      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
        You're receiving this because you have email reminders enabled for this subscription in SubTrack.
      </p>
    </div>
  </div>
</body>
</html>`.trim();

      // Send email via Resend API
      try {
        console.log(`Sending reminder for ${sub.tool_name} to ${sub.email}`);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: sub.email,
            subject: `${sub.tool_name} — Subscription expiring on ${formattedDate}`,
            html: emailHtml,
          }),
        });

        if (!res.ok) {
          const errorBody = await res.text();
          console.error(
            `Failed to send email for subscription ${sub.id} (${sub.tool_name}) to ${sub.email}: ${res.status} ${errorBody}`
          );
          failures.push({ id: sub.id, email: sub.email, error: `${res.status}: ${errorBody}` });
          continue;
        }

        emailsSent++;
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : String(emailError);
        console.error(
          `Error sending email for subscription ${sub.id} (${sub.tool_name}) to ${sub.email}: ${errorMessage}`
        );
        failures.push({ id: sub.id, email: sub.email, error: errorMessage });
        continue;
      }
    }

    if (failures.length > 0) {
      console.log(`Completed with ${failures.length} failure(s) out of ${emailsSent + failures.length} attempts.`);
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Edge function error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { "Content-Type": "application/json" }, status: 400 }
    );
  }
});
