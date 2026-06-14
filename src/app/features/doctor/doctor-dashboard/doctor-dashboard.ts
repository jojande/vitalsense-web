import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentResponseDTO } from '../../../core/models/appointment.models';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <div class="dashboard-container">
      <h1>Doctor Dashboard</h1>
      <p>Welcome back, Dr. {{ authService.currentUser()?.lastName }}!</p>
      
      <div class="appointments-section">
        <h2>Your Schedule</h2>
        <div class="appointment-grid">
          @for (appt of appointments; track appt.appointmentId) {
            <mat-card>
              <mat-card-header>
                <mat-card-title>Patient ID: {{ appt.patientId }}</mat-card-title>
                <mat-card-subtitle>{{ appt.scheduledDate | date:'medium' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p>Status: <strong>{{ appt.status }}</strong></p>
                @if (appt.meetLink) {
                  <p><a [href]="appt.meetLink" target="_blank">Join Meeting</a></p>
                }
              </mat-card-content>
            </mat-card>
          } @empty {
            <p>No appointments scheduled for today.</p>
          }
        </div>
      </div>
    </div>
  `,
  styles: `
    .dashboard-container {
      margin-top: 20px;
    }
    .appointment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 15px;
    }
  `
})
export class DoctorDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  appointments: AppointmentResponseDTO[] = [];

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user && user.profileId) {
      this.appointmentService.getAppointmentsByDoctorId(user.profileId).subscribe({
        next: (data) => this.appointments = data,
        error: (err) => console.error('Failed to load appointments', err)
      });
    }
  }
}
