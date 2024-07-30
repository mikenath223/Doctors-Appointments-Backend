export interface DoctorsAvailability {
  id: string;
  doctorId: string; // ID of the doctor
  date: string; // Date of availability in YYYY-MM-DD format
  availableTimes: TimeSlot[]; // Array of available time slots
}

export interface TimeSlot {
  startTime: string; // Start time of the slot in HH:MM format
  available: boolean; // Indicates if the slot is available or not
}
