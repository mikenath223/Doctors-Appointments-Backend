export enum APPOINTMENT_STATUS {
  upcoming = "UPCOMING",
  cancelled = "CANCELLED",
  completed = "COMPLETED",
}

export interface Appointments {
  id?: string;
  userId: string;
  doctorId: string;
  purpose: string;
  date: string | Date;
  time: string;
  status: APPOINTMENT_STATUS;
  createdAt: any;
  updatedAt: any;
}
