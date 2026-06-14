import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, UserResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;
  
  currentUser = signal<UserResponse | null>(null);

  constructor() {
    console.log('AuthService initialized. Token:', this.getToken());
    if (this.isAuthenticated()) {
      this.getMe().subscribe({
        next: (user) => console.log('Session restored for:', user.email),
        error: (err) => {
          console.error('Session restoration failed:', err);
          this.logout();
        }
      });
    }
  }

  login(credentials: LoginRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, credentials, { responseType: 'text' }).pipe(
      tap(token => {
        localStorage.setItem('token', token);
      })
    );
  }

  register(userData: RegisterRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/register`, userData, { responseType: 'text' });
  }

  registerPatient(patientData: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/register/patient`, patientData, { responseType: 'text' });
  }

  registerDoctor(doctorData: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/register/doctor`, doctorData, { responseType: 'text' });
  }

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
