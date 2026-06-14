import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TimeSlotRequest {
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

export interface BatchAvailabilityRequest {
  doctorId: number;
  slots: TimeSlotRequest[];
}

@Injectable({
  providedIn: 'root'
})
export class AvailabilityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/availability`;

  saveAvailabilityBatch(request: BatchAvailabilityRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/batch`, request, { responseType: 'text' });
  }

  getDoctorAvailability(doctorId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctor/${doctorId}`);
  }
}
