# API Usage Guide - Appointments & Services

## Tổng quan

Hệ thống API cho **Appointments** và **Services** đã được tích hợp đầy đủ với React Query hooks.

---

## 📦 Services

### 1. Service Endpoints

```typescript
import { serviceService } from '@/services/serviceService';

// GET /api/Services - Lấy tất cả services
const services = await serviceService.getAll();

// GET /api/Services/{serviceId} - Lấy service theo ID
const service = await serviceService.getById(serviceId);

// POST /api/Services - Tạo service mới (Admin)
const newService = await serviceService.create({
  name: 'Legal Consultation',
  description: 'General legal consultation session',
  price: 150,
});

// PUT /api/Services/{serviceId} - Cập nhật service (Admin)
const updated = await serviceService.update(serviceId, {
  name: 'Updated Name',
  description: 'Updated Description',
  price: 200,
});

// DELETE /api/Services/{serviceId} - Xóa service (Admin)
await serviceService.delete(serviceId);
```

### 2. Service Hooks

```typescript
import { useServices, useServiceDetail, useServiceActions } from '@/hooks/useService';

// Lấy danh sách tất cả services
const { data: services, isLoading } = useServices();

// Lấy chi tiết service
const { data: service } = useServiceDetail(serviceId);

// Admin actions
const { create, update, remove } = useServiceActions();

// Tạo service
await create({
  name: 'New Service',
  description: 'Description',
  price: 100,
});

// Cập nhật service
await update({
  serviceId: 'uuid',
  data: { name: 'Updated', description: 'New desc', price: 150 },
});

// Xóa service
await remove('service-uuid');
```

---

## 📅 Appointments

### 1. Appointment Endpoints

```typescript
import { appointmentService } from '@/services/appointmentService';

// POST /api/Appointments - Tạo appointment mới
const appointment = await appointmentService.create({
  slotId: 'slot-uuid',
});

// GET /api/Appointments/my-appointments - Lấy appointments của user
const myAppointments = await appointmentService.getMyAppointments();

// GET /api/Appointments/lawyer/{lawyerId} - Lấy appointments của luật sư
const lawyerAppointments = await appointmentService.getByLawyer(lawyerId);

// GET /api/Appointments/{appointmentId} - Lấy chi tiết appointment
const detail = await appointmentService.getById(appointmentId);

// PATCH /api/Appointments/{appointmentId}/status - Cập nhật trạng thái
const updated = await appointmentService.updateStatus(appointmentId, {
  status: 'Confirmed',
});

// PATCH /api/Appointments/{appointmentId}/cancel - Hủy appointment
await appointmentService.cancel(appointmentId);
```

### 2. Appointment Hooks

```typescript
import {
  useMyAppointments,
  useAppointmentsByLawyer,
  useAppointmentDetail,
  useAppointments,
} from '@/hooks/useAppointment';

// Lấy appointments của user hiện tại
const { data: myAppointments, isLoading } = useMyAppointments();

// Lấy appointments của luật sư
const { data: lawyerAppts } = useAppointmentsByLawyer(lawyerId);

// Lấy chi tiết appointment
const { data: appointment } = useAppointmentDetail(appointmentId);

// Combined actions
const { create, updateStatus, cancel } = useAppointments();

// Tạo appointment
await create({ slotId: 'slot-uuid' });

// Cập nhật trạng thái
await updateStatus({
  appointmentId: 'appt-uuid',
  data: { status: 'Confirmed' },
});

// Hủy appointment
await cancel('appointment-uuid');
```

---

## 📚 TypeScript Types

### Service Types

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string | null;
}
```

### Appointment Types

```typescript
interface MyAppointment {
  id: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  createdAt: string;
  date: string;
  startTime: string;
  endTime: string;
  serviceName: string;
  servicePrice: number;
  lawyerName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
}

interface AppointmentDetail {
  id: string;
  userId: string;
  slotId: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  user: AppointmentUser;
  slot: Slot;
}
```

---

## 🎯 Ví dụ sử dụng trong Component

### Component hiển thị danh sách Services

```tsx
import { useServices } from '@/hooks/useService';

function ServiceList() {
  const { data: services, isLoading, error } = useServices();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading services</div>;

  return (
    <div>
      {services?.map((service) => (
        <div key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          <p>Price: ${service.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### Component đặt lịch hẹn

```tsx
import { useAppointments } from '@/hooks/useAppointment';
import { useState } from 'react';

function BookingForm() {
  const { create } = useAppointments();
  const [slotId, setSlotId] = useState('');

  const handleSubmit = async () => {
    try {
      await create({ slotId });
      alert('Appointment created successfully!');
    } catch (error) {
      alert('Failed to create appointment');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={slotId} onChange={(e) => setSlotId(e.target.value)} placeholder="Slot ID" />
      <button type="submit">Book Appointment</button>
    </form>
  );
}
```

---

## ✅ Hoàn thành

- ✅ `appointmentService.ts` - API endpoints cho appointments
- ✅ `serviceService.ts` - API endpoints cho services
- ✅ `useAppointment.ts` - React Query hooks cho appointments
- ✅ `useService.ts` - React Query hooks cho services
- ✅ TypeScript types đầy đủ
- ✅ Cấu trúc response chuẩn AuthResponse<T>
- ✅ Error handling và cache invalidation
