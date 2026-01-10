import React from 'react';
import type { Evidence, RequestNotification, RequestType } from '@/types/notifications';

interface Props {
  data: RequestNotification[];
  onClickItem?: (item: RequestNotification) => void;
  onMarkAllRead?: () => void;
}

const TYPE_COLOR: Record<RequestType, string> = {
  CUU_TRO: 'text-red-600',
  LUONG_THUC: 'text-green-600',
  KHAC: 'text-blue-600',
};

const TYPE_LABEL: Record<RequestType, string> = {
  CUU_TRO: 'Cứu trợ',
  LUONG_THUC: 'Lương thực',
  KHAC: 'Khác',
};

const Notification: React.FC<Props> = ({ data, onClickItem, onMarkAllRead }) => {
  return (
    <div className="w-[420px] rounded-xl border bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold text-lg">Notification</h3>
        <button onClick={onMarkAllRead} className="text-sm text-gray-500 hover:text-gray-800">
          Mark all as read
        </button>
      </div>

      {/* List */}
      <div className="divide-y max-h-[520px] overflow-y-auto">
        {data.length === 0 && (
          <p className="p-4 text-sm text-gray-400 text-center">Không có thông báo</p>
        )}

        {data.map((item) => (
          <NotificationItem key={item.id} item={item} onClick={onClickItem} />
        ))}
      </div>
    </div>
  );
};

export default Notification;

interface ItemProps {
  item: RequestNotification;
  onClick?: (item: RequestNotification) => void;
}

const NotificationItem: React.FC<ItemProps> = ({ item, onClick }) => {
  return (
    <div
      onClick={() => onClick?.(item)}
      className="flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50"
    >
      {/* Unread dot */}
      {item.unread && <span className="mt-2 w-2 h-2 rounded-full bg-purple-500" />}

      {/* Avatar */}
      <img
        src={item.requesterAvatar || '/avatars/default.png'}
        className="w-9 h-9 rounded-full object-cover"
        alt={item.requesterName}
      />

      {/* Content */}
      <div className="flex-1 text-sm">
        <p className="text-gray-800">
          <strong>{item.requesterName}</strong>{' '}
          <span className={TYPE_COLOR[item.requestType]}>
            gửi yêu cầu {TYPE_LABEL[item.requestType]}
          </span>
        </p>

        <p className="text-gray-600 mt-0.5 line-clamp-2">{item.description}</p>

        <p className="text-xs text-gray-400 mt-1">
          {item.location} · {item.createdAt}
        </p>

        {item.evidences && item.evidences.length > 0 && (
          <div className="flex gap-2 mt-2">
            {item.evidences.slice(0, 3).map((ev, idx) => (
              <EvidencePreview key={idx} evidence={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
interface EvidenceProps {
  evidence: Evidence;
}

const EvidencePreview: React.FC<EvidenceProps> = ({ evidence }) => {
  if (evidence.type === 'VIDEO') {
    return (
      <div className="relative w-16 h-16 rounded-md overflow-hidden border">
        <img src={evidence.thumbnail} alt="video evidence" className="w-full h-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center text-white text-xl">
          ▶
        </span>
      </div>
    );
  }

  return (
    <img
      src={evidence.url}
      alt="image evidence"
      className="w-16 h-16 rounded-md object-cover border"
    />
  );
};
