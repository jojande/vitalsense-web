import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorResponse } from '../models/doctor.models';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/doctors`;

  searchDoctors(specialty: string): Observable<DoctorResponse[]> {
    const params = new HttpParams().set('specialty', specialty);
    return this.http.get<DoctorResponse[]>(`${this.apiUrl}/search`, { params });
  }

  getDoctorById(id: number): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/${id}`);
  }
}
