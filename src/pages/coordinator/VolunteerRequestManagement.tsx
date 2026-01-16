// ... keep imports
import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { volunteerRequestsData } from './components/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import type { VolunteerRequest } from './components/types';

export default function CoordinatorVolunteerRequestPage() {
  const [selectedId, setSelectedId] = useState<string>(volunteerRequestsData[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'health' | 'rescue' | 'transport'>('all');

  const selectedRequest = useMemo(
    () => volunteerRequestsData.find((r) => r.id === selectedId) || volunteerRequestsData[0],
    [selectedId],
  );

  const filteredRequests = useMemo(() => {
    return volunteerRequestsData.filter((req) => {
      const matchesSearch =
        req.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.phone.includes(searchTerm);

      // Simple mock filter logic based on skills/role
      let matchesFilter = true;
      if (filter === 'health')
        matchesFilter = req.skills.some(
          (s) =>
            s.toLowerCase().includes('y tế') ||
            s.toLowerCase().includes('sơ cứu') ||
            s.toLowerCase().includes('thuốc'),
        );
      if (filter === 'rescue')
        matchesFilter = req.skills.some(
          (s) => s.toLowerCase().includes('cứu hộ') || s.toLowerCase().includes('bơi'),
        );
      if (filter === 'transport')
        matchesFilter = req.skills.some(
          (s) => s.toLowerCase().includes('lái xe') || s.toLowerCase().includes('vận chuyển'),
        );

      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filter]);

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
        {/* LEFT SIDEBAR: LIST */}
        <aside className="w-[420px] flex flex-col border-r border-surface-dark-highlight bg-card-dark overflow-hidden shrink-0">
          {/* Header & Search */}
          <div className="p-4 border-b border-surface-dark-highlight flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold leading-tight text-primary">Duyệt đơn đăng ký</h1>
              <p className="text-muted-foreground text-sm">
                {filteredRequests.length} đơn mới đang chờ xử lý
              </p>
            </div>
            {/* Search */}
            <div className="flex w-full items-center rounded-lg border border-border-dark bg-background-dark px-3 py-2">
              <span className="material-symbols-outlined text-text-sub-dark mr-2">search</span>
              <input
                className="w-full bg-transparent text-text-main-dark placeholder:text-text-sub-dark outline-none text-sm"
                placeholder="Tìm tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilter('all')}
                className="rounded-full h-8 text-xs"
              >
                Tất cả
              </Button>
              <Button
                size="sm"
                variant={filter === 'health' ? 'primary' : 'outline'}
                onClick={() => setFilter('health')}
                className="rounded-full h-8 text-xs"
              >
                Y tế
              </Button>
              <Button
                size="sm"
                variant={filter === 'rescue' ? 'primary' : 'outline'}
                onClick={() => setFilter('rescue')}
                className="rounded-full h-8 text-xs"
              >
                Cứu hộ
              </Button>
              <Button
                size="sm"
                variant={filter === 'transport' ? 'primary' : 'outline'}
                onClick={() => setFilter('transport')}
                className="rounded-full h-8 text-xs"
              >
                Vận chuyển
              </Button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedId(req.id)}
                className={cn(
                  'group flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all border',
                  selectedId === req.id
                    ? 'bg-surface-dark-highlight border-primary/50'
                    : 'hover:bg-surface-dark-highlight border-transparent hover:border-border-dark',
                )}
              >
                <div
                  className="bg-center bg-no-repeat bg-cover rounded-full h-12 w-12 shrink-0 border border-border-dark"
                  style={{ backgroundImage: `url("${req.avatar}")` }}
                />
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3
                      className={cn(
                        'text-base font-bold truncate',
                        selectedId === req.id
                          ? 'text-text-main-dark'
                          : 'text-text-sub-dark group-hover:text-text-main-dark',
                      )}
                    >
                      {req.name}
                    </h3>
                    {req.status === 'new' && (
                      <span className="text-primary text-xs font-medium bg-primary/10 px-2 py-0.5 rounded">
                        Mới
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-yellow-500 text-[16px]">
                      {req.skills[0]?.includes('Y tế')
                        ? 'medical_services'
                        : req.skills[0]?.includes('Vận chuyển')
                          ? 'local_shipping'
                          : 'engineering'}
                    </span>
                    <span
                      className={cn(
                        'text-sm truncate',
                        selectedId === req.id
                          ? 'text-text-main-dark'
                          : 'text-text-sub-dark group-hover:text-text-main-dark',
                      )}
                    >
                      {req.skills.join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-text-sub-dark text-xs">
                      {req.location} • 15 phút trước
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT CONTENT: DETAIL VIEW */}
        <section className="flex-1 flex flex-col h-full bg-card-dark relative overflow-y-auto custom-scrollbar">
          {selectedRequest ? (
            <>
              {/* Header */}
              <div className="p-8 pb-6 border-b border-surface-dark-highlight">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex gap-6">
                    <div
                      className="bg-center bg-no-repeat bg-cover rounded-xl h-24 w-24 shrink-0 border-2 border-border-dark shadow-lg"
                      style={{ backgroundImage: `url("${selectedRequest.avatar}")` }}
                    />
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight text-text-main-dark">
                          {selectedRequest.name}
                        </h1>
                        <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold border border-yellow-500/30 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                          Chờ duyệt
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-text-sub-dark text-base mt-1">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">cake</span>
                          <span>
                            {selectedRequest.age} tuổi ({selectedRequest.gender})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[20px]">location_on</span>
                          <span>{selectedRequest.address}</span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-border-dark bg-surface-dark-highlight text-xs font-medium text-text-main-dark">
                          <span className="material-symbols-outlined text-[14px] text-green-500">
                            verified
                          </span>
                          SĐT đã xác thực
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-border-dark bg-surface-dark-highlight text-xs font-medium text-text-main-dark">
                          <span className="material-symbols-outlined text-[14px] text-green-500">
                            verified
                          </span>
                          CCCD đã xác thực
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-text-sub-dark">
                    <span className="text-sm">
                      Gửi đơn lúc: {new Date(selectedRequest.submittedAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm">ID Đơn: #{selectedRequest.id}</span>
                  </div>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="p-8 grid grid-cols-12 gap-8 max-w-[1200px]">
                {/* Left Col */}
                <div className="col-span-8 space-y-8">
                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-background-dark border border-border-dark flex items-center gap-4">
                      <div className="size-10 rounded-full bg-surface-dark-highlight flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">call</span>
                      </div>
                      <div>
                        <p className="text-text-sub-dark text-xs uppercase font-semibold tracking-wider">
                          Số điện thoại
                        </p>
                        <p className="text-text-main-dark text-lg font-medium font-mono">
                          {selectedRequest.phone}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-background-dark border border-border-dark flex items-center gap-4">
                      <div className="size-10 rounded-full bg-surface-dark-highlight flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined">mail</span>
                      </div>

                      {/* QUAN TRỌNG */}
                      <div className="min-w-0 flex-1">
                        <p className="text-text-sub-dark text-xs uppercase font-semibold tracking-wider">
                          Email/Zalo
                        </p>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p
                                className="
                                                              text-text-main-dark text-lg font-medium dark:text-text-main-light
                                                              truncate cursor-help
                                                            "
                              >
                                {selectedRequest.email}
                              </p>
                            </TooltipTrigger>

                            <TooltipContent className="max-w-xs break-words">
                              {selectedRequest.email}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-text-main-dark">
                      <span className="material-symbols-outlined text-primary">handyman</span>
                      Kỹ năng & Kinh nghiệm
                    </h3>
                    <div className="p-6 rounded-xl bg-background-dark border border-border-dark space-y-6">
                      <div>
                        <p className="text-text-sub-dark text-sm mb-3">Nhóm kỹ năng chính:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRequest.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 rounded-lg bg-surface-dark-highlight text-text-main-dark border border-border-dark text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-text-sub-dark text-sm mb-3">Mô tả kinh nghiệm:</p>
                        <p className="text-text-main-dark leading-relaxed text-base">
                          {selectedRequest.experience}
                        </p>
                      </div>
                      {selectedRequest.images.length > 0 && (
                        <div>
                          <p className="text-text-sub-dark text-sm mb-3">Ảnh/Chứng chỉ đính kèm:</p>
                          <div className="flex gap-3">
                            {selectedRequest.images.map((img, idx) => (
                              <div
                                key={idx}
                                className="h-20 w-28 bg-cover bg-center rounded-lg border border-border-dark cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ backgroundImage: `url("${img.url}")` }}
                                title={img.caption}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="col-span-4 space-y-6">
                  {/* Readiness */}
                  <div className="p-5 rounded-xl bg-background-dark border border-border-dark">
                    <h3 className="text-lg font-bold mb-4 text-text-main-dark">Khả năng đáp ứng</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded hover:bg-surface-dark-highlight transition-colors">
                        <span className="text-text-sub-dark">Sức khỏe tốt</span>
                        <span
                          className={cn(
                            'material-symbols-outlined',
                            selectedRequest.readiness.health ? 'text-green-500' : 'text-red-500',
                          )}
                        >
                          {selectedRequest.readiness.health ? 'check_circle' : 'cancel'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-surface-dark-highlight transition-colors">
                        <span className="text-text-sub-dark">Có phương tiện cá nhân</span>
                        <span
                          className={cn(
                            'material-symbols-outlined',
                            selectedRequest.readiness.vehicle
                              ? 'text-green-500'
                              : 'text-text-sub-dark',
                          )}
                        >
                          {selectedRequest.readiness.vehicle ? 'check_circle' : 'remove_circle'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-surface-dark-highlight transition-colors">
                        <span className="text-text-sub-dark">Sẵn sàng đi tỉnh xa</span>
                        <span
                          className={cn(
                            'material-symbols-outlined',
                            selectedRequest.readiness.travel
                              ? 'text-green-500'
                              : 'text-text-sub-dark',
                          )}
                        >
                          {selectedRequest.readiness.travel ? 'check_circle' : 'remove_circle'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded hover:bg-surface-dark-highlight transition-colors">
                        <span className="text-text-sub-dark">Cam kết tối thiểu 3 ngày</span>
                        <span
                          className={cn(
                            'material-symbols-outlined',
                            selectedRequest.readiness.commitment
                              ? 'text-green-500'
                              : 'text-text-sub-dark',
                          )}
                        >
                          {selectedRequest.readiness.commitment ? 'check_circle' : 'remove_circle'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="p-5 rounded-xl bg-surface-dark-highlight/50 border border-border-dark">
                    <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-text-sub-dark">
                      Ghi chú nội bộ
                    </h3>
                    <textarea
                      className="w-full bg-background-dark border border-border-dark rounded-lg p-3 text-text-main-dark text-sm focus:ring-1 focus:ring-primary outline-none resize-none h-32"
                      placeholder="Nhập ghi chú cho điều phối viên khác..."
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div
                className="sticky bottom-0 left-0 right-0 p-6 bg-card-dark/90
  backdrop-blur-md border-t border-border-dark flex justify-between items-center z-20 shadow-2xl mt-auto"
              >
                <Button variant="outline" className="gap-2">
                  <span className="material-symbols-outlined">history</span>
                  Xem lịch sử
                </Button>
                <div className="flex gap-4">
                  <Button variant="outline" className="gap-2">
                    <span className="material-symbols-outlined">help</span>
                    Yêu cầu thêm thông tin
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10 dark:text-red-500 dark:border-red-500/30 dark:hover:bg-red-500/10"
                  >
                    <span className="material-symbols-outlined">close</span>
                    Từ chối
                  </Button>
                  <Button variant="primary" className="gap-2 text-lg px-8 dark:text-white">
                    <span className="material-symbols-outlined">check</span>
                    Chấp nhận & Điều phối
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-sub-dark">
              Chọn một đơn đăng ký để xem chi tiết
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
