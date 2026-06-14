import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReminderRequestDTO {
  patientId: number;
  medicationName: string;
  purpose: string;
  frequency: string;
  reminderTime: string; // HH:mm
}

export interface ReminderResponseDTO {
  reminderId: number;
  patientId: number;
  medicationName: string;
  purpose: string;
  frequency: string;
  reminderTime: string;
  active: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reminders`;

  createReminder(request: ReminderRequestDTO): Observable<ReminderResponseDTO> {
    return this.http.post<ReminderResponseDTO>(this.apiUrl, request);
  }

  getRemindersByPatient(patientId: number): Observable<ReminderResponseDTO[]> {
    return this.http.get<ReminderResponseDTO[]>(`${this.apiUrl}/patient/${patientId}`);
  }

  toggleReminder(reminderId: number): Observable<ReminderResponseDTO> {
    return this.http.patch<ReminderResponseDTO>(`${this.apiUrl}/${reminderId}/toggle`, {});
  }

  deleteReminder(reminderId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${reminderId}`);
  }
}
