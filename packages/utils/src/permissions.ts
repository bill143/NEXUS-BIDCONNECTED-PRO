import type { UserRole } from "@bidconnect/types";

/**
 * RBAC permission matrix.
 * Maps action → array of roles that can perform it.
 */
const PERMISSION_MATRIX: Record<string, UserRole[]> = {
  // Projects
  "project.create": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.view.mine": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "project.view.office": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "project.view.company": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "project.edit": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.close": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.archive": ["SUPER_ADMIN", "ORG_ADMIN"],
  "project.delete": ["SUPER_ADMIN", "ORG_ADMIN"],
  "project.duplicate": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.reopen": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.mute": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "project.export": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],

  // Project Team
  "project.team.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "project.team.add": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.team.remove": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "project.team.change_role": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Bid Packages
  "bid_package.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "bid_package.create": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "bid_package.edit": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "bid_package.delete": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "bid_package.close": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "bid_package.reopen": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Bid Invitations
  "invitation.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "invitation.send": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "invitation.resend": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "invitation.revoke": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "invitation.apply_template": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "invitation.award": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Bid Submissions
  "submission.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "submission.leveling": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "submission.export": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "submission.annotate": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],

  // Documents
  "document.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "document.download": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "document.upload": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "document.version": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "document.edit": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "document.delete": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "document.addendum": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "document.visibility": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Comments
  "comment.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "comment.post": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "comment.edit_own": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "comment.delete_own": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "comment.delete_any": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Companies
  "company.search": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "company.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "company.add": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "company.edit": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "company.contacts": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "company.history": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "company.prequal.request": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "company.prequal.review": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "company.prequal.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],

  // Templates
  "bidder_template.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "bidder_template.create": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "bidder_template.edit": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "bidder_template.delete": ["SUPER_ADMIN", "ORG_ADMIN"],
  "bid_form_template.view": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR"],
  "bid_form_template.create": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "bid_form_template.edit": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "bid_form_template.delete": ["SUPER_ADMIN", "ORG_ADMIN"],

  // Analytics
  "analytics.dashboard": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "analytics.project": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "analytics.response_rates": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "analytics.bid_coverage": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR"],
  "analytics.sub_performance": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "analytics.export": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Organization Settings
  "org.settings.view": ["SUPER_ADMIN", "ORG_ADMIN"],
  "org.settings.edit": ["SUPER_ADMIN", "ORG_ADMIN"],
  "org.offices.manage": ["SUPER_ADMIN", "ORG_ADMIN"],
  "org.email_logs": ["SUPER_ADMIN", "ORG_ADMIN"],
  "org.audit_trail": ["SUPER_ADMIN", "ORG_ADMIN"],

  // User Management
  "user.list": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],
  "user.invite": ["SUPER_ADMIN", "ORG_ADMIN"],
  "user.role_change": ["SUPER_ADMIN", "ORG_ADMIN"],
  "user.deactivate": ["SUPER_ADMIN", "ORG_ADMIN"],
  "user.view_profile": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER"],

  // Admin Panel
  "admin.orgs": ["SUPER_ADMIN"],
  "admin.sudo": ["SUPER_ADMIN"],
  "admin.billing": ["SUPER_ADMIN"],
  "admin.platform_analytics": ["SUPER_ADMIN"],
  "admin.csi_manage": ["SUPER_ADMIN"],
  "admin.feature_flags": ["SUPER_ADMIN"],
  "admin.all_email_logs": ["SUPER_ADMIN"],
  "admin.all_audit_logs": ["SUPER_ADMIN"],

  // Notifications
  "notification.view_own": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "notification.preferences": ["SUPER_ADMIN", "ORG_ADMIN", "PROJECT_MANAGER", "BID_COORDINATOR", "ESTIMATOR", "VIEWER"],
  "notification.view_all": ["SUPER_ADMIN"],
};

/**
 * Check if a user with a given role can perform a specific action.
 */
export function canPerform(role: UserRole, action: string): boolean {
  const allowedRoles = PERMISSION_MATRIX[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

/**
 * Get all actions a role can perform.
 */
export function getPermissionsForRole(role: UserRole): string[] {
  return Object.entries(PERMISSION_MATRIX)
    .filter(([_, roles]) => roles.includes(role))
    .map(([action]) => action);
}

/**
 * Role hierarchy (higher index = more authority).
 */
const ROLE_HIERARCHY: UserRole[] = [
  "VIEWER",
  "ESTIMATOR",
  "BID_COORDINATOR",
  "PROJECT_MANAGER",
  "ORG_ADMIN",
  "SUPER_ADMIN",
];

/**
 * Check if roleA has equal or greater authority than roleB.
 */
export function hasAuthorityOver(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(roleA) >= ROLE_HIERARCHY.indexOf(roleB);
}

/**
 * Check if a role is at least the specified minimum role.
 */
export function isAtLeast(role: UserRole, minimum: UserRole): boolean {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(minimum);
}