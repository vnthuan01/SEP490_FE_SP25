import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type RequestStatus = 'urgent' | 'high' | 'normal';
type ProcessStatus = 'submitted' | 'approved' | 'in_progress' | 'completed' | 'rejected';
type SupportType = 'food' | 'medicine' | 'evacuation' | 'rescue' | 'other';

interface RequestMedia {
  type: 'image' | 'video';
  url: string;
}

interface Request {
  id: string;
  name: string;
  phone: string;
  address: string;
  location: string;
  supportType: SupportType[];
  status: RequestStatus;
  processStatus: ProcessStatus;
  time: string;
  aiScore?: number;
  description: string;
  media?: RequestMedia[];
}

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  urgent: {
    label: 'NGUY CẤP',
    className: 'bg-red-500/10 text-red-500 border border-red-500/20',
  },
  high: {
    label: 'CAO',
    className: 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  },
  normal: {
    label: 'BÌNH THƯỜNG',
    className: 'bg-primary/10 text-primary border border-primary/20',
  },
};

const getAiBadgeClass = (score: number) => {
  if (score >= 85) {
    return 'bg-red-500/15 text-red-600 border border-red-500/30';
  }
  if (score >= 70) {
    return 'bg-amber-500/20 text-amber-700 border border-amber-500/30';
  }
  if (score >= 50) {
    return 'bg-blue-500/15 text-blue-600 border border-blue-500/30';
  }
  return 'bg-surface-dark-highlight text-text-sub-dark border border-border-dark';
};

const processConfig: Record<ProcessStatus, { label: string; icon: string; className: string }> = {
  submitted: { label: 'Đã gửi', icon: 'upload', className: 'text-text-sub-dark' },
  approved: { label: 'Đã chấp thuận', icon: 'check_circle', className: 'text-blue-500' },
  in_progress: {
    label: 'Đang xử lý',
    icon: 'sync',
    className: 'text-orange-500',
  },
  completed: { label: 'Hoàn thành', icon: 'verified', className: 'text-green-500' },
  rejected: { label: 'Bị hủy', icon: 'cancel', className: 'text-red-500' },
};

const supportTypeConfig: Record<SupportType, { label: string; icon: string }> = {
  food: { label: 'Lương thực', icon: 'restaurant' },
  medicine: { label: 'Thuốc men', icon: 'medical_services' },
  evacuation: { label: 'Sơ tán', icon: 'directions_run' },
  rescue: { label: 'Cứu hộ', icon: 'support' },
  other: { label: 'Khác', icon: 'more_horiz' },
};

const actionConfig: Record<ProcessStatus, { primary?: string; secondary?: string }> = {
  submitted: { primary: 'Chấp thuận', secondary: 'Từ chối' },
  approved: { primary: 'Bắt đầu xử lý' },
  in_progress: { primary: 'Hoàn thành' },
  completed: {},
  rejected: {},
};

const mockRequests: Request[] = [
  {
    id: '8291',
    name: 'Nguyễn Văn An',
    phone: '0987 123 456',
    address: 'Thôn Đông, Xã Cẩm Duệ, Huyện Cẩm Xuyên',
    location: 'Hà Tĩnh',
    supportType: ['food', 'medicine', 'evacuation'],
    status: 'urgent',
    processStatus: 'in_progress',
    time: '15 phút trước',
    aiScore: 98,
    description:
      'Do ảnh hưởng của mưa lớn kéo dài nhiều ngày, khu vực sinh sống của gia đình đã bị ngập sâu gần tới mái nhà. Trong nhà hiện có một cụ ông 80 tuổi bị liệt không thể di chuyển và hai trẻ nhỏ. Nguồn điện đã bị cắt hoàn toàn, nước sinh hoạt không còn sử dụng được, lương thực dự trữ đã cạn kiệt. Đường vào khu vực bị ngập sâu và chia cắt, các phương tiện không thể tiếp cận. Gia đình cần được hỗ trợ khẩn cấp về sơ tán, lương thực và thuốc men.',
    media: [
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      },
    ],
  },
  {
    id: '8292',
    name: 'Trần Thị Bích',
    phone: '0912 456 789',
    address: 'Phường Thạch Đài, TP Hà Tĩnh',
    location: 'Hà Tĩnh',
    supportType: ['medicine'],
    status: 'high',
    processStatus: 'approved',
    time: '42 phút trước',
    aiScore: 75,
    description:
      'Khu vực phường Thạch Đài đang bị ngập cục bộ sau mưa lớn, việc di chuyển gặp nhiều khó khăn. Gia đình có trẻ nhỏ đang bị sốt cao và ho kéo dài nhưng không thể ra ngoài mua thuốc do đường ngập và thiếu phương tiện. Hiện trong nhà chỉ còn một ít thuốc hạ sốt thông thường, không đủ dùng trong trường hợp bệnh nặng hơn. Gia đình đề nghị được hỗ trợ thuốc men thiết yếu cho trẻ em trong thời gian sớm nhất.',
    media: [
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
    ],
  },
  {
    id: '8293',
    name: 'Lê Văn Cường',
    phone: '0905 333 111',
    address: 'Xã Kỳ Anh',
    location: 'Hà Tĩnh',
    supportType: ['other'],
    status: 'normal',
    processStatus: 'submitted',
    time: '1 giờ trước',
    description:
      'Sau đợt mưa lớn, mực nước tại khu vực xã Kỳ Anh đang rút chậm nhưng chưa gây thiệt hại nghiêm trọng đến nhà cửa hay con người. Người dân vẫn có thể sinh hoạt tạm thời, tuy nhiên cần được theo dõi tình hình vì nước rút không đều và có nguy cơ mưa tiếp diễn. Yêu cầu này chủ yếu mang tính thông báo để chính quyền và lực lượng chức năng nắm tình hình và sẵn sàng hỗ trợ nếu cần.',
    media: [
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
      {
        type: 'image',
        url: 'https://tse2.mm.bing.net/th/id/OIP.bZvrW9XD1hLYdmNz7kS1PAHaE-?rs=1&pid=ImgDetMain&o=7&rm=3',
      },
    ],
  },

  {
    id: '8294',
    name: 'Hoàng Thị Mai',
    phone: '0977 888 999',
    address: 'Quảng Bình',
    location: 'Quảng Bình',
    supportType: ['rescue'],
    status: 'high',
    processStatus: 'completed',
    time: '2 giờ trước',
    description: 'Sạt lở đất, đã được cứu hộ an toàn.',
  },
];

const statusCount = {
  all: mockRequests.length,
  urgent: mockRequests.filter((r) => r.status === 'urgent').length,
  high: mockRequests.filter((r) => r.status === 'high').length,
  normal: mockRequests.filter((r) => r.status === 'normal').length,
};

const badgeClass =
  'ml-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium';

export default function CoordinatorRequestManagementPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request>(mockRequests[0]);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = useMemo(() => {
    let res = mockRequests;
    if (filterStatus !== 'all') {
      res = res.filter((r) => r.status === filterStatus);
    }
    if (searchTerm) {
      res = res.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.phone.includes(searchTerm) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return res;
  }, [filterStatus, searchTerm]);

  const actions = actionConfig[selectedRequest.processStatus];

  return (
    <DashboardLayout
      projects={[
        { label: 'Tổng quan', path: '/portal/coordinator/coordination', icon: 'dashboard' },
        { label: 'Điều phối & Bản đồ', path: '/portal/coordinator/maps', icon: 'map' },
        { label: 'Đội tình nguyện', path: '/portal/coordinator/teams', icon: 'groups' },
        {
          label: 'Yêu cầu tình nguyện',
          path: '/portal/coordinator/volunteer-requests',
          icon: 'how_to_reg',
        },
        {
          label: 'Yêu cầu cứu trợ',
          path: '/portal/coordinator/requests',
          icon: 'person_raised_hand',
        },
        {
          label: 'Kho vận & Nhu yếu phẩm',
          path: '/portal/coordinator/inventory',
          icon: 'inventory_2',
        },
      ]}
      navItems={[
        { label: 'Báo cáo & Thống kê', path: '/portal/coordinator/dashboard', icon: 'description' },
      ]}
    >
      <div className="flex h-[calc(100vh-6rem)] overflow-hidden -m-6">
        {/* ================= LEFT ================= */}
        <aside className="w-[420px] flex flex-col border-r border-surface-dark-highlight bg-card-dark overflow-hidden shrink-0">
          {/* HEADER */}
          <div className="p-4 border-b border-surface-dark-highlight flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold leading-tight text-text-main-dark">
                Yêu cầu cứu trợ
              </h1>
              <p className="text-sm text-text-sub-dark">
                Tổng {filteredRequests.length} yêu cầu cần xử lý
              </p>
            </div>

            {/* SEARCH */}
            <div className="flex w-full items-center rounded-lg border border-border-dark bg-background-dark px-3 py-2">
              <span className="material-symbols-outlined text-text-sub-dark mr-2">search</span>
              <input
                className="w-full bg-transparent text-text-main-dark placeholder:text-text-sub-dark outline-none text-sm"
                placeholder="Tìm tên, SĐT, địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* FILTER */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="rounded-full h-8 text-xs dark:text-white"
              >
                Tất cả
                <span
                  className={`${badgeClass} ${
                    filterStatus === 'all' ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  {statusCount.all}
                </span>
              </Button>

              <Button
                size="sm"
                variant={filterStatus === 'urgent' ? 'destructive' : 'outline'}
                onClick={() => setFilterStatus('urgent')}
                className="rounded-full h-8 text-xs dark:text-white"
              >
                Nguy cấp
                <span
                  className={`${badgeClass} ${
                    filterStatus === 'urgent'
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {statusCount.urgent}
                </span>
              </Button>

              <Button
                size="sm"
                variant={filterStatus === 'high' ? 'warning' : 'outline'}
                onClick={() => setFilterStatus('high')}
                className="rounded-full h-8 text-xs dark:text-white"
              >
                Cao
                <span
                  className={`${badgeClass} ${
                    filterStatus === 'high' ? 'bg-white/20 text-white' : 'bg-muted text-foreground'
                  }`}
                >
                  {statusCount.high}
                </span>
              </Button>

              <Button
                size="sm"
                variant={filterStatus === 'normal' ? 'primary' : 'outline'}
                onClick={() => setFilterStatus('normal')}
                className="rounded-full h-8 text-xs dark:text-white"
              >
                Bình thường
                <span
                  className={`${badgeClass} ${
                    filterStatus === 'normal'
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {statusCount.normal}
                </span>
              </Button>
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRequests.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRequest(r)}
                className={cn(
                  'group flex cursor-pointer flex-col gap-2 rounded-lg p-3 transition-all',
                  'border border-transparent bg-background-dark',
                  selectedRequest.id === r.id
                    ? 'bg-surface-dark-highlight border-primary/50 shadow-md'
                    : 'hover:bg-surface-dark-highlight hover:border-border-dark hover:shadow-sm',
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3
                      className={cn(
                        'text-base font-bold truncate',
                        selectedRequest.id === r.id
                          ? 'text-text-main-dark'
                          : 'text-text-sub-dark group-hover:text-text-main-dark',
                      )}
                    >
                      {r.name}
                    </h3>
                    <p className="text-xs text-text-sub-dark mt-0.5">{r.location}</p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border',
                      statusConfig[r.status].className,
                    )}
                  >
                    {statusConfig[r.status].label}
                  </span>
                </div>

                <p className="text-sm text-text-sub-dark line-clamp-2">{r.description}</p>

                <div className="flex justify-between items-center mt-1 border-t border-border-dark/50 pt-2">
                  <span className="text-xs text-text-sub-dark flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    {r.time}
                  </span>

                  {typeof r.aiScore === 'number' && (
                    <span
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getAiBadgeClass(
                        r.aiScore,
                      )}`}
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      AI Score: {r.aiScore}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ================= RIGHT ================= */}
        <section className="flex-1 flex flex-col h-full bg-card-dark relative overflow-y-auto custom-scrollbar">
          {selectedRequest ? (
            <>
              {/* Header */}
              <div className="p-8 pb-6 border-b border-surface-dark-highlight">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-black tracking-tight text-text-main-dark">
                        Yêu cầu #{selectedRequest.id}
                      </h1>
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-sm font-bold border flex items-center gap-2 uppercase tracking-wider',
                          statusConfig[selectedRequest.status].className,
                        )}
                      >
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                        {statusConfig[selectedRequest.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-text-sub-dark text-base mt-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                        <span className="font-semibold text-text-main-dark">
                          {selectedRequest.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">call</span>
                        <span className="font-mono">{selectedRequest.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                        <span>{selectedRequest.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {actions?.secondary && (
                      <Button
                        variant="outline"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                      >
                        {actions.secondary}
                      </Button>
                    )}
                    {actions?.primary && (
                      <Button variant="primary" className="dark:text-white">
                        {actions.primary}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Grid */}
              <div className="p-8 grid grid-cols-12 gap-8 max-w-[1200px]">
                {/* Left Column */}
                <div className="col-span-8 space-y-8">
                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-text-main-dark">
                      <span className="material-symbols-outlined text-primary">description</span>
                      Nội dung yêu cầu
                    </h3>
                    <div className="p-6 rounded-xl bg-background-dark border border-border-dark">
                      <p className="text-text-main-dark leading-relaxed text-base">
                        {selectedRequest.description}
                      </p>

                      <div className="mt-6">
                        <p className="text-text-sub-dark text-sm mb-3 uppercase font-semibold tracking-wider">
                          Cần hỗ trợ về:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.supportType.map((t) => (
                            <span
                              key={t}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-dark-highlight text-text-main-dark border border-border-dark text-sm font-medium"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {supportTypeConfig[t].icon}
                              </span>
                              {supportTypeConfig[t].label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  {selectedRequest.media && selectedRequest.media.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-text-main-dark">
                        <span className="material-symbols-outlined text-primary">perm_media</span>
                        Hình ảnh/Video đính kèm
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {selectedRequest.media.map((m, i) =>
                          m.type === 'image' ? (
                            <div
                              key={i}
                              className="aspect-square bg-cover bg-center rounded-xl border border-border-dark cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ backgroundImage: `url("${m.url}")` }}
                            />
                          ) : (
                            <video
                              key={i}
                              src={m.url}
                              controls
                              className="w-full aspect-video rounded-xl border border-border-dark bg-black"
                            />
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="col-span-4 space-y-6">
                  {/* Process Status */}
                  <div className="p-5 rounded-xl bg-background-dark border border-border-dark">
                    <h3 className="text-lg font-bold mb-4 text-text-main-dark">Tiến trình xử lý</h3>
                    <div className="space-y-4 relative">
                      {/* Timeline line */}
                      <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border-dark z-0"></div>

                      {Object.entries(processConfig).map(([key, cfg]) => {
                        const active = key === selectedRequest.processStatus;
                        // const past = ... logic if needed, simplify for now
                        return (
                          <div
                            key={key}
                            className={cn('flex gap-3 relative z-10', active ? '' : 'opacity-40')}
                          >
                            <div
                              className={cn(
                                'w-6 h-6 rounded-full bg-background-dark border-2 flex items-center justify-center shrink-0',
                                active ? 'border-primary' : 'border-border-dark',
                              )}
                            >
                              <div
                                className={cn(
                                  'w-2.5 h-2.5 rounded-full',
                                  active ? 'bg-primary' : 'bg-border-dark',
                                )}
                              ></div>
                            </div>
                            <div>
                              <p
                                className={cn(
                                  'text-sm font-bold',
                                  active ? 'text-text-main-dark' : 'text-text-sub-dark',
                                )}
                              >
                                {cfg.label}
                              </p>
                              {active && (
                                <p className="text-xs text-primary font-medium mt-0.5">
                                  Trạng thái hiện tại
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {typeof selectedRequest.aiScore === 'number' && (
                    <div className="p-5 rounded-xl bg-surface-dark-highlight/30 border border-border-dark">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-text-sub-dark">
                          AI Đánh giá
                        </h3>
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black text-text-main-dark">
                          {selectedRequest.aiScore}
                        </span>
                        <span className="text-sm text-text-sub-dark mb-1.5">/ 100 điểm</span>
                      </div>
                      <div className="w-full bg-background-dark h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-primary"
                          style={{ width: `${selectedRequest.aiScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-text-sub-dark mt-3 leading-relaxed">
                        Hệ thống đánh giá mức độ khẩn cấp dựa trên từ khóa và hình ảnh được cung
                        cấp.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-sub-dark">
              Chọn một yêu cầu để xem chi tiết
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
