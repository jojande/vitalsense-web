export interface PrescriptionRequestDTO {
  appointmentId: number;
  medications: string;
  instructions: string;
}

export interface PrescriptionResponseDTO {
  prescriptionId: number;
  appointmentId: number;
  medications: string;
  instructions: string;
  createdAt: string; // ISO string (LocalDateTime serializado)
}