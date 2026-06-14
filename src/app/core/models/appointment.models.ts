export interface AppointmentRequestDTO {
  patientId: number;
  doctorId: number;
  scheduledDate: string; // ISO string
  paymentAmount: number;
}

export interface AppointmentResponseDTO {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  scheduledDate: string;
  status: string;
  paymentStatus: string;
  meetLink?: string;
}
