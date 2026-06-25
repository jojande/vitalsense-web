import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrescriptionRequestDTO, PrescriptionResponseDTO } from '../models/prescription.models';

@Injectable({
  providedIn: 'root'
})
export class PrescriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/prescriptions`;

  createPrescription(request: PrescriptionRequestDTO): Observable<PrescriptionResponseDTO> {
    return this.http.post<PrescriptionResponseDTO>(this.apiUrl, request);
  }

  getPrescriptionByAppointmentId(appointmentId: number): Observable<PrescriptionResponseDTO> {
    return this.http.get<PrescriptionResponseDTO>(`${this.apiUrl}/appointment/${appointmentId}`);
  }
}