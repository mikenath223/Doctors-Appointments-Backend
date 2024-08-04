export enum APPOINTMENT_STATUS {
  upcoming = "UPCOMING",
  cancelled = "CANCELLED",
  completed = "COMPLETED",
}

export enum CONSULTATION_TYPE {
  messaging = "MESSAGING",
  voiceCall = "VOICE_CALL",
  videoCall = "VIDEO_CALL",
  inPerson = "IN_PERSON",
}

export interface Appointments {
  id?: string;
  userId: string;
  doctorId: string;
  purpose: string;
  date: string | Date;
  time: string;
  status: APPOINTMENT_STATUS;
  amountPaid: string;
  consultation: CONSULTATION_TYPE;
  meetingLink: string;
  refundAmount?: string;
  createdAt: any;
  updatedAt: any;
}

export enum CURRENCY {
  NGN = "NGN",
}
