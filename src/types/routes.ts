// routes/types.ts
import { type UserRoleType } from '@/enums/UserRole';
import type { ReactNode } from 'react';

export type AppRoute = {
  path: string;
  element: ReactNode;
  roles?: UserRoleType[];
  isProtected?: boolean;
};
