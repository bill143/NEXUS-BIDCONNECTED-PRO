export const EMAIL_TEMPLATES = {
  ITB_INVITATION: "itb-invitation",
  ADDENDUM_NOTIFICATION: "addendum-notification",
  BID_SUBMISSION_RECEIPT: "bid-submission-receipt",
  BID_DEADLINE_REMINDER: "bid-deadline-reminder",
  BID_AWARD_NOTIFICATION: "bid-award-notification",
  TEAM_MEMBER_INVITE: "team-member-invite",
  PREQUAL_REQUEST: "prequal-request",
  MENTION_NOTIFICATION: "mention-notification",
  PASSWORD_RESET: "password-reset",
  WELCOME_EMAIL: "welcome-email",
} as const;

export type EmailTemplateName = (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];