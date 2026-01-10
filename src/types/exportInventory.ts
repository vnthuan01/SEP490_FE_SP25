/* ================= TYPES ================= */

export interface ExportItem {
  id: string;
  name: string;
  category: string;
  icon?: string;
  current: number;
  capacity: number;
  unit: string;
  quantity?: number;
  status?: 'normal' | 'warning' | 'danger';
}

export interface Team {
  id: string;
  name: string;
}

export interface ExportInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ExportItem[];
  teams: Team[];
  onSubmit: (items: ExportItem[], note: string, teamId: string) => void;
}
