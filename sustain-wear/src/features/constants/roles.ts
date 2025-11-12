// /constants/roles.ts

export const ROLES = {
    ADMIN: "AD",
    DONOR: "DO",
    CHARITY: "CH",
    ORG_OWNER: "OO",
  } as const;
  
  export type Role = (typeof ROLES)[keyof typeof ROLES];
  