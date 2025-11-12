// /constants/roles.ts

export const ROLES = {
  DONOR: "DONOR",
  ORG_STAFF: "ORG_STAFF",
  ORG_ADMIN: "ORG_ADMIN",
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
  