# Tasks

## Task 1: Activate Resend email integration in Edge Function
- [x] Uncomment the Resend API fetch call in `supabase/functions/send-reminders/index.ts`
- [x] Update the query to use `reminderDays` field per subscription instead of hardcoded 3 days
- [x] Add status filter to include both "active" and "trial" subscriptions (currently only filters "active")
- [x] Add proper error handling: log failures per email, continue processing, return count
- [x] Format the email HTML with toolName, formatted trialEndDate, and app link
- [x] Skip subscriptions with missing or empty `email` field (already handled, verify behavior)
- [x] Return JSON response with `{ success: true, emailsSent: N }` on completion

## Task 2: Configure cron trigger for Edge Function
- [ ] Create a SQL migration or Supabase dashboard config to schedule the edge function daily via pg_cron
- [x] Document the cron setup in a README or comment within the migration file

## Task 3: Create ForgotPassword page
- [x] Create `src/app/pages/ForgotPassword.tsx` with email input, submit button, and back-to-login link
- [x] Implement form submission calling `supabase.auth.resetPasswordForEmail(email, { redirectTo })` where redirectTo points to the app's `/reset-password` route
- [x] Add success message display ("Check your inbox") and error handling via sonner toast
- [x] Style using shadcn/ui Card, CardHeader, CardContent, Input, Button, Label components matching Login.tsx pattern

## Task 4: Create ResetPassword page
- [x] Create `src/app/pages/ResetPassword.tsx` with new password input, confirm password input, and submit button
- [x] Implement validation: passwords must match and be >= 6 characters, show inline error messages
- [x] Implement form submission calling `supabase.auth.updateUser({ password })`
- [x] Add success toast and redirect to `/login` on successful password update
- [x] Add error handling for failed password update via sonner toast
- [x] Style using shadcn/ui Card, CardHeader, CardContent, Input, Button, Label components matching Login.tsx pattern

## Task 5: Add Forgot Password link to Login page
- [x] Add a "Forgot Password?" link below the password field in `src/app/pages/Login.tsx`
- [x] Link navigates to `/forgot-password` route using react-router-dom Link or useNavigate
- [x] Style the link with `text-primary hover:underline` to match existing toggle link style

## Task 6: Update AuthContext for PASSWORD_RECOVERY event
- [x] Modify `src/app/contexts/AuthContext.tsx` to detect `PASSWORD_RECOVERY` event in `onAuthStateChange`
- [x] Navigate to `/reset-password` when PASSWORD_RECOVERY event fires (use window.location or pass navigate via prop)
- [x] Ensure user session is set from the recovery session so `updateUser` succeeds on the reset page

## Task 7: Add routes for forgot-password and reset-password
- [x] Import ForgotPassword and ResetPassword pages in `src/app/App.tsx`
- [x] Add `<Route path="/forgot-password" element={<ForgotPassword />} />` as a public route (no ProtectedRoute wrapper)
- [x] Add `<Route path="/reset-password" element={<ResetPassword />} />` as a public route (no ProtectedRoute wrapper)
- [x] Place new routes alongside the existing `/login` route
## Task 8: Fix email filter on Subscriptions page to show all subscriptions with the same email

- [ ] 8.1 Normalize email comparison in the filter logic
  - In `src/app/pages/Subscriptions.tsx`, update the `matchesEmail` filter to use case-insensitive comparison: `sub.email.toLowerCase() === emailFilter.toLowerCase()`
  - This ensures emails like "User@gmail.com" and "user@gmail.com" are treated as the same account
  - _Requirements: 1.1 (subscription email field usage)_

- [ ] 8.2 Normalize the email dropdown options to avoid duplicates
  - Update the `emails` array derivation to normalize emails to lowercase before deduplication: `Array.from(new Set(subscriptions.map(s => s.email.toLowerCase())))`
  - Display the original email casing in the dropdown but use normalized value for filtering
  - Handle edge case where `email` field might be `null` or `undefined` — filter those out before building the list
  - _Requirements: 1.5 (skip subscriptions with missing/empty email)_

- [ ] 8.3 Ensure the search query also matches email field correctly
  - Verify the existing search logic `sub.email.toLowerCase().includes(searchQuery.toLowerCase())` works alongside the email dropdown filter
  - When both search query and email filter are active, both conditions should apply (AND logic — already implemented)
  - _Requirements: 1.1_

- [ ] 8.4 Add empty state messaging for email filter
  - When the email filter is active but no subscriptions match (e.g., data changed), show a clear "No subscriptions found for this email" message
  - Ensure the "Clear Filters" button resets the email filter back to "all"
  - _Requirements: 1.1_

- [ ] 8. Checkpoint - Verify email filtering works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks 1-7 are completed (email alerts and forgot password flow)
- Task 8 addresses the subscription page email filter to ensure all subscriptions associated with the same email address are correctly displayed when filtering
- The email filter UI already exists in `src/app/pages/Subscriptions.tsx` — the fix focuses on normalizing email comparison to handle case differences and edge cases
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["8.1", "8.2"] },
    { "id": 1, "tasks": ["8.3", "8.4"] }
  ]
}
```