# Requirements Document

## Introduction

This feature adds two capabilities to the SubTrack SaaS subscription tracking app: (1) automated email notifications that alert users when their subscriptions are approaching expiry, and (2) a complete forgot password / reset password flow using Supabase Auth. Together these improve user retention by proactively reminding users about expiring subscriptions and removing friction from account recovery.

## Glossary

- **Edge_Function**: A Supabase Edge Function (Deno-based serverless function) deployed at `supabase/functions/send-reminders/index.ts` that queries expiring subscriptions and sends reminder emails.
- **Resend_Service**: The third-party email delivery service (Resend) used to send transactional emails via its REST API.
- **Subscription**: A database record representing a user's tracked SaaS subscription, containing fields such as `toolName`, `trialEndDate`, `reminderDays`, `email`, and `status`.
- **Reminder_Days**: The number of days before a subscription's `trialEndDate` at which the system sends an email reminder (default: 3 days).
- **Auth_Client**: The Supabase Auth client (`supabase.auth`) used for authentication operations including password reset.
- **Reset_Token**: A secure token embedded in the password reset email link that authorizes the user to set a new password.
- **App_Router**: The react-router-dom v7 routing configuration in `App.tsx` that maps URL paths to page components.

## Requirements

### Requirement 1: Daily Subscription Expiry Email Reminders

**User Story:** As a SubTrack user, I want to receive email reminders before my subscriptions expire, so that I can decide whether to renew or cancel before the deadline.

#### Acceptance Criteria

1. WHEN the Edge_Function is invoked, THE Edge_Function SHALL query all Subscription records where `status` is "active" or "trial" and `trialEndDate` falls within the next `reminderDays` days from the current date.
2. WHEN an expiring Subscription is found, THE Resend_Service SHALL send an email to the Subscription's `email` address containing the `toolName`, the formatted `trialEndDate`, and a link back to the SubTrack application.
3. WHEN the Edge_Function completes successfully, THE Edge_Function SHALL return a JSON response with `success: true` and the count of emails sent.
4. IF the Resend_Service returns an error for a specific email, THEN THE Edge_Function SHALL log the error and continue processing remaining subscriptions without halting.
5. IF a Subscription has no `email` field or an empty `email` value, THEN THE Edge_Function SHALL skip that Subscription and proceed to the next one.
6. THE Edge_Function SHALL be triggered automatically once per day via a scheduled cron job configured in the Supabase project.

### Requirement 2: Forgot Password Link on Login Page

**User Story:** As a user who has forgotten their password, I want to see a "Forgot Password?" link on the login page, so that I can initiate the password recovery process.

#### Acceptance Criteria

1. WHEN the Login page is rendered, THE Login page SHALL display a "Forgot Password?" link below the password input field.
2. WHEN a user clicks the "Forgot Password?" link, THE App_Router SHALL navigate the user to the `/forgot-password` route.

### Requirement 3: Forgot Password Page

**User Story:** As a user who has forgotten their password, I want to enter my email address and receive a password reset link, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN the Forgot Password page is rendered, THE Forgot Password page SHALL display an email input field and a submit button.
2. WHEN a user submits a valid email address, THE Auth_Client SHALL call `resetPasswordForEmail` with the provided email and a redirect URL pointing to the `/reset-password` route.
3. WHEN the reset email request succeeds, THE Forgot Password page SHALL display a success message instructing the user to check their inbox.
4. IF the reset email request fails, THEN THE Forgot Password page SHALL display an error message describing the failure.
5. WHEN the Forgot Password page is rendered, THE Forgot Password page SHALL display a link to navigate back to the Login page.

### Requirement 4: Reset Password Page

**User Story:** As a user who clicked the password reset link in their email, I want to set a new password, so that I can regain access to my account with updated credentials.

#### Acceptance Criteria

1. WHEN the Reset Password page is rendered, THE Reset Password page SHALL display a new password input field, a confirm password input field, and a submit button.
2. WHEN a user submits matching passwords that meet minimum length of 6 characters, THE Auth_Client SHALL call `updateUser` with the new password.
3. IF the two password fields do not match, THEN THE Reset Password page SHALL display a validation error and prevent submission.
4. IF the new password is fewer than 6 characters, THEN THE Reset Password page SHALL display a validation error indicating the minimum length requirement.
5. WHEN the password update succeeds, THE Reset Password page SHALL display a success message and redirect the user to the Login page.
6. IF the password update fails, THEN THE Reset Password page SHALL display an error message describing the failure.

### Requirement 5: Auth State Handling for Password Recovery

**User Story:** As a developer, I want the auth context to handle the `PASSWORD_RECOVERY` event from Supabase, so that users arriving via the reset link are properly routed to the reset password page.

#### Acceptance Criteria

1. WHEN the Auth_Client emits a `PASSWORD_RECOVERY` auth state change event, THE AuthContext SHALL detect this event and navigate the user to the `/reset-password` route.
2. WHILE the user is on the Reset Password page, THE Auth_Client SHALL maintain the user's session so that `updateUser` can be called successfully.

### Requirement 6: Route Configuration

**User Story:** As a developer, I want the application router to include routes for the forgot password and reset password pages, so that users can access these pages via URL navigation.

#### Acceptance Criteria

1. THE App_Router SHALL include a route at `/forgot-password` that renders the Forgot Password page.
2. THE App_Router SHALL include a route at `/reset-password` that renders the Reset Password page.
3. WHILE a user is not authenticated, THE App_Router SHALL allow access to `/forgot-password` and `/reset-password` without redirecting to the login page.
