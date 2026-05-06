import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export function CoordinatorDashboardReportControls({
  fromDate,
  toDate,
  groupBy,
  setGroupBy,
  setSection,
  onRefresh,
  onChangeFromDate,
  onChangeToDate,
  selectedTeamLabel,
  selectedTeamIds,
  setSelectedTeamIds,
  teamOptions,
  isLoadingTeams,
  toggleTeamFilter,
}: {
  fromDate: string;
  toDate: string;
  groupBy: 'day' | 'week' | 'month';
  setGroupBy: (value: 'day' | 'week' | 'month') => void;
  setSection: (value: 'dashboard' | 'reports') => void;
  onRefresh: () => void;
  onChangeFromDate: (value: string) => void;
  onChangeToDate: (value: string) => void;
  selectedTeamLabel: string;
  selectedTeamIds: string[];
  setSelectedTeamIds: (value: string[]) => void;
  teamOptions: Array<{ label: string; value: string; note: string }>;
  isLoadingTeams: boolean;
  toggleTeamFilter: (teamId: string) => void;
}) {
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Từ ngày
          </p>
          <Input
            type="date"
            value={fromDate}
            onChange={(event) => onChangeFromDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Đến ngày
          </p>
          <Input
            type="date"
            value={toDate}
            onChange={(event) => onChangeToDate(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Nhóm xu hướng
          </p>
          <Select
            value={groupBy}
            onValueChange={(value) => setGroupBy(value as 'day' | 'week' | 'month')}
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue placeholder="Chọn nhóm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Theo ngày</SelectItem>
              <SelectItem value="week">Theo tuần</SelectItem>
              <SelectItem value="month">Theo tháng</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" className="gap-2" onClick={onRefresh}>
            <span className="material-symbols-outlined text-sm">refresh</span>
            Làm mới dữ liệu
          </Button>
          <Button variant="primary" className="gap-2" onClick={() => setSection('dashboard')}>
            <span className="material-symbols-outlined text-sm">monitoring</span>
            Về tổng quan
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Lọc đội cứu trợ của trạm</p>
            <p className="text-xs text-muted-foreground">
              Chỉ lấy chiến dịch/nhiệm vụ của đội được gán cho trạm hiện tại.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info" appearance="outline" size="sm">
              {selectedTeamLabel}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedTeamIds([])}
              disabled={selectedTeamIds.length === 0}
            >
              Bỏ lọc đội
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isLoadingTeams ? (
            <Skeleton className="h-9 w-40 rounded-full" />
          ) : teamOptions.length > 0 ? (
            teamOptions.map((team) => {
              const isSelected = selectedTeamIds.includes(team.value);
              return (
                <button
                  key={team.value}
                  type="button"
                  onClick={() => toggleTeamFilter(team.value)}
                  className={`rounded-full border px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{team.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{team.note}</span>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Chưa có đội nào thuộc trạm hiện tại.</p>
          )}
        </div>
      </div>
    </>
  );
}
