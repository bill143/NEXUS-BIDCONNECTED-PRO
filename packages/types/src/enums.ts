// Re-export Prisma enums as shared types
export type OrgPlan = "FREE" | "PRO" | "ENTERPRISE";
export type UserRole =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "PROJECT_MANAGER"
  | "ESTIMATOR"
  | "BID_COORDINATOR"
  | "VIEWER";
export type ProjectStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
export type ProjectType =
  | "GENERAL_CONTRACTING"
  | "CM_AT_RISK"
  | "DESIGN_BUILD"
  | "OWNER_CONTROLLED"
  | "OTHER";
export type ProjectVisibility = "PUBLIC" | "PRIVATE" | "INVITE_ONLY";
export type BidPackageStatus =
  | "DRAFT"
  | "OPEN"
  | "CLOSED"
  | "AWARDED"
  | "CANCELLED";
export type BidInvitationStatus =
  | "INVITED"
  | "VIEWED"
  | "BIDDING"
  | "SUBMITTED"
  | "DECLINED"
  | "AWARDED"
  | "NOT_BIDDING";
export type DocumentCategory =
  | "PLANS"
  | "SPECIFICATIONS"
  | "ADDENDA"
  | "RFIS"
  | "SUBMITTALS"
  | "REPORTS"
  | "PHOTOS"
  | "CONTRACTS"
  | "OTHER";
export type DocumentVisibility =
  | "ALL_INVITED"
  | "GC_TEAM_ONLY"
  | "SPECIFIC_COMPANIES";
export type NotificationType =
  | "ITB_RECEIVED"
  | "ITB_REMINDER_48H"
  | "ITB_REMINDER_24H"
  | "ADDENDUM_UPLOADED"
  | "DOCUMENT_ADDED"
  | "BID_SUBMITTED"
  | "BID_REVISED"
  | "BID_DECLINED"
  | "BID_VIEWED"
  | "BID_AWARDED"
  | "PROJECT_CLOSED"
  | "PROJECT_CREATED"
  | "TEAM_MEMBER_ADDED"
  | "COMMENT_MENTION"
  | "PREQUALIFICATION_REQUESTED"
  | "PREQUALIFICATION_APPROVED"
  | "PREQUALIFICATION_REJECTED"
  | "DEADLINE_APPROACHING"
  | "SYSTEM";
export type PrequalificationStatus =
  | "NOT_REQUESTED"
  | "SENT"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";
export type ActivityAction =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_CLOSED"
  | "PROJECT_ARCHIVED"
  | "PROJECT_DUPLICATED"
  | "BID_PACKAGE_CREATED"
  | "BID_PACKAGE_UPDATED"
  | "BID_PACKAGE_CLOSED"
  | "ITB_SENT"
  | "ITB_RESENT"
  | "BID_VIEWED"
  | "BID_DECLINED"
  | "BID_SUBMITTED"
  | "BID_REVISED"
  | "BID_AWARDED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_VERSIONED"
  | "DOCUMENT_DELETED"
  | "ADDENDUM_PUBLISHED"
  | "TEAM_MEMBER_ADDED"
  | "TEAM_MEMBER_REMOVED"
  | "COMMENT_POSTED"
  | "COMMENT_DELETED"
  | "PROJECT_SETTINGS_CHANGED"
  | "COMPANY_ADDED"
  | "CONTACT_ADDED"
  | "PREQUALIFICATION_REQUESTED"
  | "PREQUALIFICATION_STATUS_CHANGED";
export type BidFormFieldType =
  | "CURRENCY"
  | "NUMBER"
  | "TEXT"
  | "TEXTAREA"
  | "BOOLEAN"
  | "SELECT"
  | "MULTI_SELECT"
  | "DATE"
  | "UNIT_PRICE"
  | "LUMP_SUM"
  | "ALLOWANCE"
  | "ALTERNATE"
  | "SECTION_HEADER"
  | "DIVIDER";
export type ProjectMembershipRole =
  | "manager"
  | "estimator"
  | "coordinator"
  | "viewer";