import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { NewInventoryItem, ItemInventoryProps } from '@/types/createItemInventory';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const CATEGORIES = [
  {
    value: 'food',
    label: 'Lương thực',
    icon: 'restaurant',
    color: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
  },
  {
    value: 'water',
    label: 'Nước uống',
    icon: 'water_drop',
    color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  },
  {
    value: 'medical',
    label: 'Y tế & thuốc',
    icon: 'medication',
    color: 'text-red-600 bg-red-500/10 border-red-500/20',
  },
  {
    value: 'equipment',
    label: 'Dụng cụ & lều trại',
    icon: 'camping',
    color: 'text-green-600 bg-green-500/10 border-green-500/20',
  },
  {
    value: 'other',
    label: 'Khác',
    icon: 'category',
    color: 'text-muted-foreground bg-muted border-border',
  },
];

const UNIT_OPTIONS = ['Thùng', 'Hộp', 'Bao', 'Chai', 'Cái', 'Gói'];

export function CreateInventoryItemDialog({ open, onOpenChange, onSubmit }: ItemInventoryProps) {
  const [form, setForm] = React.useState<NewInventoryItem>({
    name: '',
    category: '',
    icon: '',
    unit: '',
    quantity: 1,
    capacity: undefined,
    note: '',
  });

  const update = <K extends keyof NewInventoryItem>(key: K, value: NewInventoryItem[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.name.trim() && form.category && form.unit.trim() && form.quantity > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground">
            Nhập kho – Vật tư mới
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* NAME */}
          <div className="space-y-2">
            <Label>
              Tên vật tư <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Ví dụ: Mì tôm Hảo Hảo"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('name', e.target.value)}
            />
          </div>

          {/* CATEGORY */}
          <div className="space-y-2">
            <Label>
              Danh mục <span className="text-red-500">*</span>
            </Label>
            <Select value={form.category} onValueChange={(v: string) => update('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại vật tư" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {/* <div className={cn('flex items-center gap-2 text-sm ', c.color)}> */}
                    <span
                      className={cn(
                        'material-symbols-outlined text-[18px] border rounded-full p-1 leading-none',
                        c.color,
                      )}
                    >
                      {c.icon}
                    </span>
                    <span className="font-medium">{c.label}</span>
                    {/* </div> */}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ICON */}
          <div className="space-y-2">
            <Label>
              Icon <span className="text-red-500">*</span>{' '}
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span
                      className="
          material-symbols-outlined
          text-[18px]
          text-muted-foreground
          cursor-help
          hover:text-foreground
          transition-colors
        "
                    >
                      help
                    </span>
                  </TooltipTrigger>

                  <TooltipContent
                    side="top"
                    align="start"
                    className="
                    max-w-[260px] 
                    text-xs 
                    leading-relaxed 
                    rounded 
                    bg-background 
                    text-foreground 
                    shadow-md 
                    border border-border
                    dark:bg-slate-800 
                    dark:text-slate-100 
                    dark:border-slate-700
                    "
                  >
                    <p className="font-medium mb-1">Cách nhập Icon</p>

                    <p className="text-muted-foreground dark:text-slate-300">
                      Nhập <b>tên icon</b> từ{' '}
                      <Link
                        className="underline text-blue-500"
                        to={'https://fonts.google.com/icons'}
                        target="_blank"
                      >
                        Google Material Icons
                      </Link>
                      .
                    </p>

                    <code className="block mt-2 rounded bg-muted px-2 py-1 text-[11px] dark:bg-slate-700 dark:text-slate-100">
                      {'<span class="material-symbols-outlined">inventory_2</span>'}
                    </code>

                    <p className="text-muted-foreground mt-2 dark:text-slate-300">
                      Ví dụ: <b>inventory_2</b>, <b>water_drop</b>, <b>medication</b>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              placeholder="Ví dụ: ramen_dining, water_drop"
              value={form.icon}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('icon', e.target.value)}
            />
          </div>

          <Separator />

          {/* QUANTITY */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Số lượng nhập <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  update('quantity', Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                Đơn vị <span className="text-red-500">*</span>
              </Label>

              <select
                value={form.unit}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  update('unit', e.target.value)
                }
                className="
      w-full h-10 rounded-md border border-border
      bg-background px-3 text-sm text-foreground
      focus:outline-none focus:ring-2 focus:ring-primary
    "
              >
                <option value="">-- Chọn đơn vị --</option>

                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CAPACITY */}
          <div className="space-y-2">
            <Label>Sức chứa tối đa (optional)</Label>
            <Input
              type="number"
              min={form.quantity}
              placeholder="Ví dụ: 1000"
              value={form.capacity ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                update('capacity', e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {/* NOTE */}
          <div className="space-y-2">
            <Label>Ghi chú</Label>
            <Textarea
              rows={3}
              placeholder="Thông tin thêm về vật tư"
              value={form.note}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                update('note', e.target.value)
              }
              className="resize-none"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="border-t border-border px-6 py-4 flex justify-end gap-2 bg-muted/40">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={() => {
              onSubmit(form);
              onOpenChange(false);
            }}
          >
            <span className="material-symbols-outlined mr-2">add</span>
            Nhập kho
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
