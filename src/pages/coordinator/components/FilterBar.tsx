import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  urgencyFilter: string;
  onUrgencyFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  needsFilter: string;
  onNeedsFilterChange: (value: string) => void;
  onFitBounds: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  stats: {
    total: number;
    highUrgency: number;
    unassigned: number;
    completed: number;
  };
}

export function FilterBar({
  search,
  onSearchChange,
  urgencyFilter,
  onUrgencyFilterChange,
  statusFilter,
  onStatusFilterChange,
  needsFilter,
  onNeedsFilterChange,
  onFitBounds,
  onToggleFullscreen,
  isFullscreen,
  stats,
}: FilterBarProps) {
  return (
    <div className="border-b bg-background p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary leading-tight">
            Điều phối cứu trợ miền Trung
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} điểm cần cứu trợ • {stats.highUrgency} khẩn cấp cao
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tìm địa điểm..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64"
          />
          <Select value={urgencyFilter} onValueChange={onUrgencyFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mức độ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức độ</SelectItem>
              <SelectItem value="high">🔴 Cao</SelectItem>
              <SelectItem value="medium">🟡 Trung bình</SelectItem>
              <SelectItem value="low">🟢 Thấp</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="unassigned">Chưa xử lý</SelectItem>
              <SelectItem value="assigned">Đã gán đội</SelectItem>
              <SelectItem value="on-the-way">Đang đi</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
          <Select value={needsFilter} onValueChange={onNeedsFilterChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nhu cầu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhu cầu</SelectItem>
              <SelectItem value="food">🍚 Lương thực</SelectItem>
              <SelectItem value="water">💧 Nước</SelectItem>
              <SelectItem value="medicine">💊 Thuốc</SelectItem>
              <SelectItem value="emergencyRescue">🚑 Cứu hộ</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={onFitBounds} title="Xem tất cả">
            <span className="material-symbols-outlined text-sm">zoom_out_map</span>
          </Button>
          <Button variant="outline" onClick={onToggleFullscreen} title="Toàn màn hình">
            <span className="material-symbols-outlined text-sm">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Badge variant="secondary">Tổng: {stats.total}</Badge>
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
          Khẩn cấp: {stats.highUrgency}
        </Badge>
        <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
          Chưa xử lý: {stats.unassigned}
        </Badge>
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
          Hoàn thành: {stats.completed}
        </Badge>
      </div>
    </div>
  );
}
