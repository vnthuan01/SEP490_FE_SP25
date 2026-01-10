export type RequestType = 'CUU_TRO' | 'LUONG_THUC' | 'KHAC';
export type EvidenceType = 'IMAGE' | 'VIDEO';

export interface Evidence {
  type: EvidenceType;
  url: string;
  thumbnail?: string;
}

export interface RequestNotification {
  id: string;
  requesterName: string;
  requesterAvatar?: string;
  requestType: RequestType;
  description: string;
  location: string;
  evidences?: Evidence[];
  createdAt: string;
  unread: boolean;
}
