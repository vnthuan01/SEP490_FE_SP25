import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TEAMS = [
  {
    name: 'Đội Cứu hộ 1',
    role: 'Tìm kiếm cứu nạn',
    status: 'Busy',
    members: [
      'https://i.pravatar.cc/150?u=1',
      'https://i.pravatar.cc/150?u=2',
      'https://i.pravatar.cc/150?u=3',
    ],
  },
  {
    name: 'Đội Y tế Hà Nội',
    role: 'Sơ cứu & Y tế',
    status: 'Available',
    members: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5'],
  },
  {
    name: 'Đội Vận chuyển',
    role: 'Logistics',
    status: 'Busy',
    members: [
      'https://i.pravatar.cc/150?u=6',
      'https://i.pravatar.cc/150?u=7',
      'https://i.pravatar.cc/150?u=8',
      'https://i.pravatar.cc/150?u=9',
    ],
  },
];

export function TeamOverview({ className }: { className?: string }) {
  return (
    <Card className={cn('bg-card border-border', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
        <CardTitle className="text-lg font-bold text-foreground">Đội phản ứng nhanh</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {TEAMS.map((team, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
          >
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-foreground">{team.name}</h4>
              <p className="text-xs text-muted-foreground">{team.role}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {team.members.map((src, i) => (
                  <div
                    key={i}
                    className="size-6 rounded-full border border-card bg-muted overflow-hidden"
                  >
                    <img src={src} alt="Member" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                  team.status === 'Busy'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-primary/10 text-primary',
                )}
              >
                {team.status}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
