// ═══════════════════════════════════════════════════════════════
// SHARED MODEL TYPES (mirrors Prisma but usable in client)
// ═══════════════════════════════════════════════════════════════

import type {
  ProjectStatus,
  ProjectType,
  ProjectVisibility,
  BidPackageStatus,
  BidInvitationStatus,
  DocumentCategory,
  DocumentVisibility,
  NotificationType,
  UserRole,
  BidFormFieldType,
  ActivityAction,
  PrequalificationStatus,
  OrgPlan,
} from "./enums";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  phone: string | null;
  website: string | null;
  plan: OrgPlan;
  planExpiresAt: string | null;
  defaultTimezone: string;
  defaultCurrency: string;
  notificationsEmail: string | null;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  organizationId: string;
  officeId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  title: string | null;
  phone: string | null;
  mobile: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  isInternal: boolean;
  lastLoginAt: string | null;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  organizationId: string;
  officeId: string | null;
  number: string | null;
  name: string;
  status: ProjectStatus;
  projectType: ProjectType;
  estimatedValue: string | null;
  description: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  clientName: string | null;
  bidsdueat: string | null;
  bidsDueTimezone: string;
  dueToClientAt: string | null;
  startDate: string | null;
  endDate: string | null;
  leadUserId: string;
  visibility: ProjectVisibility;
  bidFormTemplateId: string | null;
  isMuted: boolean;
  tags: string[];
  csiDivisions: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lead?: User;
  office?: Office;
  members?: ProjectMembership[];
  bidPackages?: BidPackage[];
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  userId: string;
  role: string;
  addedBy: string;
  createdAt: string;
  user?: User;
}

export interface Office {
  id: string;
  organizationId: string;
  name: string;
  addressLine1: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface BidPackage {
  id: string;
  projectId: string;
  title: string;
  scopeOfWork: string | null;
  csiDivisionCode: string | null;
  csiDivisionName: string | null;
  budgetAmount: string | null;
  budgetVisibleToSubs: boolean;
  bidsdueat: string | null;
  bidsDueTimezone: string;
  status: BidPackageStatus;
  bidFormId: string | null;
  sortOrder: number;
  invitedCount: number;
  respondedCount: number;
  submittedCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  invitations?: BidInvitation[];
  bidForm?: BidForm;
}

export interface BidInvitation {
  id: string;
  bidPackageId: string;
  companyId: string;
  contactId: string | null;
  invitedById: string;
  status: BidInvitationStatus;
  personalNote: string | null;
  invitedAt: string;
  emailedAt: string | null;
  viewedAt: string | null;
  intentToBidAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  submittedAt: string | null;
  awardedAt: string | null;
  awardNotes: string | null;
  isNotifiedAddenda: boolean;
  createdAt: string;
  updatedAt: string;
  company?: Company;
  contact?: Contact;
  submission?: BidSubmission;
}

export interface BidSubmission {
  id: string;
  bidInvitationId: string;
  totalBaseBid: string | null;
  totalAlternates: string | null;
  totalAllowances: string | null;
  totalUnitPrices: string | null;
  grandTotal: string | null;
  notes: string | null;
  isRevised: boolean;
  revisionNumber: number;
  previousSubmissionId: string | null;
  submittedAt: string;
  updatedAt: string;
  lineItemResponses?: BidLineItemResponse[];
  attachments?: SubmissionAttachment[];
}

export interface BidLineItemResponse {
  id: string;
  bidSubmissionId: string;
  bidFormFieldId: string;
  amountValue: string | null;
  textValue: string | null;
  booleanValue: boolean | null;
  unitPrice: string | null;
  quantity: string | null;
  extendedAmount: string | null;
}

export interface SubmissionAttachment {
  id: string;
  bidSubmissionId: string;
  name: string;
  storagePath: string;
  storageUrl: string;
  fileSizeBytes: string;
  fileType: string;
  uploadedAt: string;
}

export interface Company {
  id: string;
  name: string;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  insuranceExpiryDate: string | null;
  insuranceCoverageAmount: string | null;
  prequalificationStatus: PrequalificationStatus;
  prequalificationExpiresAt: string | null;
  bcNetworkVerified: boolean;
  averageResponseRate: number | null;
  totalInvitations: number;
  totalSubmissions: number;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  trades?: CompanyTrade[];
  contacts?: Contact[];
}

export interface CompanyTrade {
  id: string;
  companyId: string;
  csiDivisionCode: string;
  csiDivisionName: string;
  isPrimary: boolean;
}

export interface Contact {
  id: string;
  companyId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  isPrimary: boolean;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  projectId: string;
  name: string;
  originalFilename: string;
  category: DocumentCategory;
  fileType: string;
  fileSizeBytes: string;
  currentVersionNumber: number;
  storagePath: string;
  storageUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  visibility: DocumentVisibility;
  isAddendum: boolean;
  addendumNumber: number | null;
  notifySubsOnUpload: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  versions?: DocumentVersion[];
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  storagePath: string;
  storageUrl: string;
  fileSizeBytes: string;
  fileType: string;
  uploadedBy: string;
  changeNotes: string | null;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  projectId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  entityType: string | null;
  entityId: string | null;
  deepLinkUrl: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  body: string;
  mentionedUserIds: string[];
  parentId: string | null;
  isEdited: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
  replies?: Comment[];
}

export interface ActivityLog {
  id: string;
  organizationId: string;
  projectId: string | null;
  entityType: string;
  entityId: string;
  action: ActivityAction;
  actorId: string;
  actorName: string;
  actorEmail: string;
  metadata: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
}

export interface BidForm {
  id: string;
  bidFormTemplateId: string | null;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  sections?: BidFormSection[];
}

export interface BidFormSection {
  id: string;
  bidFormId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  fields?: BidFormField[];
}

export interface BidFormField {
  id: string;
  sectionId: string;
  label: string;
  description: string | null;
  fieldType: BidFormFieldType;
  isRequired: boolean;
  sortOrder: number;
  unit: string | null;
  quantity: string | null;
  options: unknown;
  placeholder: string | null;
  defaultValue: string | null;
}

export interface BidFormTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BidderListTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  entries?: BidderListTemplateEntry[];
}

export interface BidderListTemplateEntry {
  id: string;
  bidderListTemplateId: string;
  companyId: string;
  contactId: string | null;
  csiDivisionCode: string | null;
  csiDivisionName: string | null;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface CsiDivision {
  code: string;
  name: string;
  description: string | null;
}

export interface ProjectAnalyticsSnapshot {
  id: string;
  projectId: string;
  organizationId: string;
  totalPackages: number;
  totalInvited: number;
  totalViewed: number;
  totalBidding: number;
  totalSubmitted: number;
  totalDeclined: number;
  totalAwarded: number;
  responseRate: number;
  coverageRate: number;
  avgBidAmount: string | null;
  lowestBid: string | null;
  highestBid: string | null;
  lastCalculatedAt: string;
}