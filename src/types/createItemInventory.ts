export interface NewInventoryItem {
  name: string;
  category: string;
  icon?: string;
  unit: string;
  quantity: number;
  capacity?: number;
  note?: string;
}

export interface ItemInventoryProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (item: NewInventoryItem) => void;
}
