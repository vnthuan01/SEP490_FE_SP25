import z from 'zod';

// ---------- Add Service Schema ----------
export const addServiceSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Service name is required').max(200),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  // coerce number từ string => number
  standardPrice: z.coerce.number().min(1, 'Standard price must be greater than 0'),
  salePrice: z.coerce.number().min(0, 'Sale price cannot be negative').optional(),
  relatedParties: z.string().trim().min(1, 'Please select a related party'),
  isMainService: z.boolean().default(false),
});
