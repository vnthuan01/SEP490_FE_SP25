import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { teamsData } from './components/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Team } from './components/types';

export default function CoordinatorTeamManagementPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamsData[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedTeam = useMemo(
    () => teamsData.find((t) => t.id === selectedTeamId) || teamsData[0],
    [selectedTeamId],
  );

  const filteredTeams = useMemo(() => {
    return teamsData.filter(
      (t) =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.leader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.area || '').toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm]);

  const stats = {
    total: teamsData.length,
    active: teamsData.filter((t) => t.status !== 'available' && t.status !== 'lost-contact').length, // moving or rescuing
    members: teamsData.reduce((acc, t) => acc + t.members, 0),
    areas: new Set(teamsData.map((t) => t.area).filter(Boolean)).size,
  };

  const getStatusBadge = (status: Team['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-500';
      case 'moving':
        return 'bg-blue-500/20 text-blue-500';
      case 'rescuing':
        return 'bg-red-500/20 text-red-500';
      case 'lost-contact':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusLabel = (status: Team['status']) => {
    switch (status) {
      case 'available':
        return 'Sẵn sàng';
      case 'moving':
        return 'Đang di chuyển';
      case 'rescuing':
        return 'Đang cứu hộ';
      case 'lost-contact':
        return 'Mất liên lạc';
      default:
        return status;
    }
  };

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
      {/* PAGE HEADER */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl text-primary font-black">Quản lý nhóm cứu trợ</h1>
          <p className="text-text-sub-dark text-lg">
            Theo dõi và điều phối các đội tình nguyện tại các khu vực bị ảnh hưởng.
          </p>
        </div>
        <Button variant="primary" className="gap-2 text-base px-6 h-12">
          <span className="material-symbols-outlined">add</span>
          Tạo nhóm mới
        </Button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card-dark border-border-dark">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-sub-dark">
              <span className="material-symbols-outlined">groups</span>
              <p className="text-sm font-medium uppercase tracking-wide">Tổng số nhóm</p>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-6xl text-green-500">check_circle</span>
          </div>
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-500">
              <span className="material-symbols-outlined">bolt</span>
              <p className="text-sm font-medium uppercase tracking-wide">Đang hoạt động</p>
            </div>
            <p className="text-3xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-sub-dark">
              <span className="material-symbols-outlined">volunteer_activism</span>
              <p className="text-sm font-medium uppercase tracking-wide">Tình nguyện viên</p>
            </div>
            <p className="text-3xl font-bold">{stats.members}</p>
          </CardContent>
        </Card>
        <Card className="bg-card-dark border-border-dark">
          <CardContent className="p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-text-sub-dark">
              <span className="material-symbols-outlined">location_on</span>
              <p className="text-sm font-medium uppercase tracking-wide">Khu vực</p>
            </div>
            <p className="text-3xl font-bold">{stats.areas} Tỉnh/TP</p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-22rem)]">
        {/* LEFT: GROUP LIST (TABLE) */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full">
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-sub-dark">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 border border-border-dark rounded-lg bg-card-dark text-white placeholder-text-sub-dark focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Tìm nhóm theo tên, khu vực, trưởng nhóm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2 h-auto">
              <span className="material-symbols-outlined">filter_list</span>
              Bộ lọc
            </Button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto rounded-xl border border-border-dark bg-card-dark custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-[#1c2127] z-10">
                <tr className="border-b border-border-dark">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-sub-dark">
                    Tên nhóm
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-sub-dark">
                    Khu vực
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-sub-dark">
                    Trưởng nhóm
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-sub-dark">
                    Thành viên
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-text-sub-dark">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filteredTeams.map((team) => (
                  <tr
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-[#2a3441]',
                      selectedTeamId === team.id ? 'bg-primary/10' : '',
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={cn(
                            'size-2 rounded-full mr-3',
                            selectedTeamId === team.id ? 'bg-primary' : 'bg-transparent',
                          )}
                        ></div>
                        <span
                          className={cn(
                            'text-sm font-bold',
                            selectedTeamId === team.id ? 'text-primary' : 'text-white',
                          )}
                        >
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-sub-dark">
                      {team.area || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {team.leader}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-sub-dark">
                      {team.members} người
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusBadge(team.status),
                        )}
                      >
                        {getStatusLabel(team.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-text-sub-dark hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: DETAIL PANEL */}
        <div className="lg:col-span-1 flex flex-col h-full gap-4">
          {selectedTeam ? (
            <div className="rounded-xl border border-border-dark bg-card-dark flex flex-col h-full overflow-hidden shadow-lg">
              {/* Header */}
              <div className="p-6 border-b border-border-dark shrink-0">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                      getStatusBadge(selectedTeam.status),
                    )}
                  >
                    {getStatusLabel(selectedTeam.status)}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 text-text-sub-dark hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button className="p-2 text-text-sub-dark hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{selectedTeam.name}</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-text-sub-dark text-sm">
                    <span className="material-symbols-outlined text-lg mr-2">location_on</span>
                    {selectedTeam.area || 'Chưa định vị'}
                  </div>
                  <div className="flex items-center text-text-sub-dark text-sm">
                    <span className="material-symbols-outlined text-lg mr-2">person</span>
                    Trưởng nhóm:{' '}
                    <span className="text-white font-medium ml-1">{selectedTeam.leader}</span>
                  </div>
                  <div className="flex items-center text-text-sub-dark text-sm">
                    <span className="material-symbols-outlined text-lg mr-2">call</span>
                    Liên hệ: {selectedTeam.contactPhone}
                  </div>
                </div>
                {/* Mini Map Preview Placeholder */}
                <div className="mt-4 w-full h-32 rounded-lg bg-[#283039] relative flex items-center justify-center border border-border-dark group cursor-pointer">
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-75 transition-opacity"
                    style={{
                      backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAv-XpNn70KGwrXp8rU_PBWA19iotbS4EQ5r83F1IZQ4DorzR3dmzjCCNKqSwS-f2v0LnjSMd9L0uDn7n0krrHMSPez9pxN6Tr8mAxFhncmHLANE_ySHEEt27d2SdtBlUnjUPNMmv2v00yJpe5xbu7qgpz09HIniz9B_-BAvQD2MZlzDavZH-rj20v6Avlog8EycqbI97KXvENXy1oDnrbrFgwcFUc6EH9q63HXbsmdMnFoO8SD79z0aL4sAvobaodKWw455nLNzwQ')`,
                    }}
                  />
                  <div className="z-10 bg-card-dark/80 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-sm">
                    <span className="material-symbols-outlined text-sm">map</span>
                    <span className="text-xs font-bold">Xem bản đồ</span>
                  </div>
                </div>
              </div>

              {/* Member List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                    Thành viên ({selectedTeam.members})
                  </h4>
                  <button className="text-primary text-sm font-bold hover:underline">
                    Quản lý
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedTeam.memberDetails && selectedTeam.memberDetails.length > 0 ? (
                    selectedTeam.memberDetails.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center p-3 rounded-lg bg-[#283039] border border-transparent hover:border-border-dark transition-colors group/member"
                      >
                        <div
                          className="size-10 rounded-full bg-cover bg-center mr-3"
                          style={{ backgroundImage: `url('${member.avatar}')` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{member.name}</p>
                          <p className="text-xs text-text-sub-dark truncate">{member.role}</p>
                        </div>
                        <button className="text-text-sub-dark hover:text-red-500 opacity-0 group-hover/member:opacity-100 transition-opacity p-1">
                          <span className="material-symbols-outlined text-xl">
                            remove_circle_outline
                          </span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-text-sub-dark text-sm">
                      Không có thông tin chi tiết thành viên.
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Action */}
              <div className="p-4 border-t border-border-dark bg-[#1c2127]">
                <Button
                  variant="outline"
                  className="w-full gap-2 border-dashed bg-transparent hover:bg-white/5"
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Thêm tình nguyện viên
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border-dark bg-card-dark flex items-center justify-center h-full text-text-sub-dark">
              Chọn một nhóm để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
