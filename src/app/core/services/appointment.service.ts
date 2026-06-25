import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppointmentRequestDTO, AppointmentResponseDTO } from '../models/appointment.models';
import { DoctorResponse } from '../models/doctor.models';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/appointments`;

  selectedDoctor = signal<DoctorResponse | null>(null);

  scheduleAppointment(request: AppointmentRequestDTO): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(this.apiUrl, request);
  }

  getAppointmentsByPatientId(patientId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  getAppointmentsByDoctorId(doctorId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  getAppointmentById(id: number): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.apiUrl}/${id}`);
  }
  
  cancelAppointment(id: number): Observable<AppointmentResponseDTO> {
    return this.http.put<AppointmentResponseDTO>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    );
  }

  rescheduleAppointment(
    id: number,
    newScheduledDate: string
  ): Observable<AppointmentResponseDTO> {
    return this.http.put<AppointmentResponseDTO>(
      `${this.apiUrl}/${id}/reschedule`,
      {
        newScheduledDate
      }
    );
  }
  
}
