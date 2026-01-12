import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

/* ================= TYPES ================= */
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

/* ================= CONFIG ================= */
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
  return 'bg-muted text-muted-foreground border';
};

const processConfig: Record<ProcessStatus, { label: string; icon: string; className: string }> = {
  submitted: { label: 'Đã gửi', icon: 'upload', className: 'text-muted-foreground' },
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

export default function CoordinatorRequestManagementPage() {
  const [selectedRequest, setSelectedRequest] = useState<Request>(mockRequests[0]);
  const [filterStatus, setFilterStatus] = useState<RequestStatus | 'all'>('all');

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return mockRequests;
    return mockRequests.filter((r) => r.status === filterStatus);
  }, [filterStatus]);

  const actions = actionConfig[selectedRequest.processStatus];

  return (
    <DashboardLayout
      projects={[
        { label: 'Tổng quan', path: '/portal/coordinator/coordination', icon: 'dashboard' },
        { label: 'Điều phối & Bản đồ', path: '/portal/coordinator/maps', icon: 'map' },
        { label: 'Đội tình nguyện', path: '/portal/coordinator/teams', icon: 'groups' },
        {
          label: 'Yêu cầu tình nguyện',
          path: '/portal/coordinator/volunteers',
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
    >
      <div className="h-[calc(100vh-64px)] flex overflow-hidden">
        {/* ================= LEFT ================= */}
        <aside className="w-[380px] border-r flex flex-col bg-muted/30">
          {/* SUMMARY */}
          <div className="p-4 border-b bg-background">
            <h1 className="text-lg font-bold text-primary">Yêu cầu cứu trợ</h1>
            <p className="text-sm text-muted-foreground">Tổng {mockRequests.length} yêu cầu</p>
            {/* <div className="flex gap-2 mt-3 flex-wrap">
              <Badge variant="destructive">Nguy cấp</Badge>
              <Badge variant="warning">Cao</Badge>
              <Badge variant="outline">Bình thường</Badge>
            </div> */}
          </div>

          {/* FILTER */}
          <div className="p-4 border-b space-y-3">
            <Input variant="md" placeholder="Tìm tên, SĐT, địa chỉ..." />

            <div className="flex gap-2 flex-wrap">
              {/* ALL */}
              <div className="relative">
                <Button
                  size="md"
                  variant={filterStatus === 'all' ? 'primary' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="pr-10"
                >
                  Tất cả
                </Button>
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center bg-primary/80 text-white">
                  {statusCount.all}
                </span>
              </div>

              {/* URGENT */}
              <div className="relative">
                <Button
                  size="md"
                  variant={filterStatus === 'urgent' ? 'destructive' : 'outline'}
                  onClick={() => setFilterStatus('urgent')}
                  className="pr-10"
                >
                  Nguy cấp
                </Button>
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center bg-red-600 text-white">
                  {statusCount.urgent}
                </span>
              </div>

              {/* HIGH */}
              <div className="relative">
                <Button
                  size="md"
                  variant={filterStatus === 'high' ? 'warning' : 'outline'}
                  onClick={() => setFilterStatus('high')}
                  className="pr-10"
                >
                  Cao
                </Button>
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center bg-amber-500 text-white">
                  {statusCount.high}
                </span>
              </div>

              {/* NORMAL */}
              <div className="relative">
                <Button
                  size="md"
                  variant={filterStatus === 'normal' ? 'primary' : 'outline'}
                  onClick={() => setFilterStatus('normal')}
                  className="pr-10"
                >
                  Bình thường
                </Button>
                <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center bg-primary/80 text-white">
                  {statusCount.normal}
                </span>
              </div>
            </div>
          </div>

          {/* LIST */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRequests.map((r) => (
              <Card
                key={r.id}
                onClick={() => setSelectedRequest(r)}
                className={`cursor-pointer rounded-xl transition ${
                  r.id === selectedRequest.id ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="font-bold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.location}</p>
                    </div>
                    <span
                      className={`px-2 py-1 h-6 text-xs rounded ${statusConfig[r.status].className}`}
                    >
                      {statusConfig[r.status].label}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-2 text-muted-foreground">{r.description}</p>
                  <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                    <span>{r.time}</span>

                    {typeof r.aiScore === 'number' && (
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${getAiBadgeClass(
                          r.aiScore,
                        )}`}
                      >
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        {r.aiScore}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </aside>

        {/* ================= RIGHT ================= */}
        <main className="flex-1 overflow-y-auto">
          {/* HEADER */}
          <div className="sticky top-0 z-10 bg-background/70 backdrop-blur border-b px-8 py-6">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold">Yêu cầu #{selectedRequest.id}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.name} • {selectedRequest.phone}
                </p>
              </div>
              <div className="flex gap-3">
                {actions?.secondary && <Button variant="outline">{actions.secondary}</Button>}
                {actions?.primary && <Button>{actions.primary}</Button>}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
            {/* DETAIL */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  <b>Địa chỉ:</b> {selectedRequest.address}
                </p>
                <p className="text-muted-foreground">{selectedRequest.description}</p>

                {/* SUPPORT TYPE */}
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.supportType.map((t) => (
                    <span
                      key={t}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-muted"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {supportTypeConfig[t].icon}
                      </span>
                      {supportTypeConfig[t].label}
                    </span>
                  ))}
                </div>

                {/* MEDIA */}
                {selectedRequest.media && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {selectedRequest.media.map((m, i) =>
                      m.type === 'image' ? (
                        <img key={i} src={m.url} className="rounded-lg border" />
                      ) : (
                        <video key={i} src={m.url} controls className="rounded-lg border" />
                      ),
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TIMELINE */}
            <Card className="sticky top-24 h-fit">
              <CardHeader>
                <CardTitle>Tiến trình xử lý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(processConfig).map(([key, cfg]) => {
                  const active = key === selectedRequest.processStatus;
                  return (
                    <div key={key} className={`flex gap-3 ${active ? '' : 'opacity-40'}`}>
                      <span className={`material-symbols-outlined !animate-none ${cfg.className}`}>
                        {cfg.icon}
                      </span>
                      <div>
                        <p className="font-medium">{cfg.label}</p>
                        {active && (
                          <p className="text-xs text-muted-foreground">Trạng thái hiện tại</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
