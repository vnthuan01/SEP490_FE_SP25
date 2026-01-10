// src/constants/roleLabel.ts
import { UserRole } from '@/enums/UserRole';

export const roleLabelMap = {
  [UserRole.Admin]: 'Quản trị viên (Admin)',
  [UserRole.Coordinator]: 'Điều phối viên',
  [UserRole.Volunteer]: 'Tình nguyện viên',
  [UserRole.User]: 'Người dùng',
} as const;
