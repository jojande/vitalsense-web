import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { ReminderService, ReminderResponseDTO } from '../../../core/services/reminder.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-medication-alarms',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="alarms-view">
      <header class="view-header">
        <h1>Configurar Alarmas de Medicación</h1>
        <p>Programa tus recordatorios para cumplir con tu tratamiento médico a tiempo.</p>
      </header>

      <!-- Step 1: Create New Alarm Form -->
      <div class="card form-card">
        <form [formGroup]="alarmForm" (ngSubmit)="saveAlarm()">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre del Medicamento</label>
              <div class="input-container">
                <input type="text" formControlName="medicationName" placeholder="Ej. Paracetamol, Metformina...">
              </div>
            </div>
            
            <div class="form-group">
              <label>Propósito / Condición</label>
              <div class="input-container">
                <input type="text" formControlName="purpose" placeholder="Ej. Presión arterial, Diabetes...">
              </div>
            </div>

            <div class="form-group">
              <label>Hora de la Alarma</label>
              <div class="input-container">
                <input type="time" formControlName="reminderTime">
                <svg class="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
            </div>

            <div class="form-group full-width">
              <label>Frecuencia (Días de la semana)</label>
              <div class="days-selector">
                <button type="button" 
                  *ngFor="let day of days" 
                  [class.selected]="selectedDays().includes(day.key)"
                  (click)="toggleDay(day.key)"
                  class="day-chip">
                  {{ day.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="form-footer">
            <button type="submit" class="save-btn" [disabled]="alarmForm.invalid || selectedDays().length === 0 || isSaving()">
              {{ isSaving() ? 'Guardando...' : 'Guardar Alarma' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Step 2: Active Alarms List -->
      <section class="alarms-list-section">
        <h2>Mis Alarmas Activas</h2>
        
        <div class="alarms-container" *ngIf="!isLoading(); else loading">
          <div class="alarms-list" *ngIf="medicationAlarms().length > 0; else emptyState">
            <div class="alarm-row" *ngFor="let alarm of medicationAlarms()">
              <div class="alarm-time">{{ alarm.reminderTime }}</div>
              <div class="alarm-info">
                <h3>{{ alarm.medicationName }}</h3>
                <p>{{ alarm.purpose }}</p>
                <div class="alarm-days">Días: {{ formatFrequency(alarm.frequency) }}</div>
              </div>
              <div class="alarm-actions">
                <label class="toggle-switch">
                  <input type="checkbox" [checked]="alarm.active" (change)="toggleAlarm(alarm)">
                  <span class="slider"></span>
                </label>
                <button class="delete-btn" (click)="deleteAlarm(alarm.reminderId)" title="Eliminar alarma">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            </div>
          </div>
          
          <ng-template #emptyState>
            <div class="empty-state">
              <p>No tienes alarmas de medicación configuradas actualmente.</p>
            </div>
          </ng-template>
        </div>

        <ng-template #loading>
          <div class="loading-state">Cargando alarmas...</div>
        </ng-template>
      </section>
    </div>
  `,
  styles: `
    .alarms-view {
      display: flex;
      flex-direction: column;
      gap: 30px;
      max-width: 1000px;
      width: 100%;
      box-sizing: border-box;
    }

    .view-header h1 { font-size: 28px; color: #1e293b; margin: 0; }
    .view-header p { color: #64748b; margin: 5px 0 0; }

    .card {
      background: white;
      border-radius: 20px;
      padding: 30px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .full-width { grid-column: span 2; }

    .form-group label {
      display: block;
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
    }

    .input-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-container input {
      width: 100%;
      padding: 12px 15px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
      font-size: 14px;
      color: #1e293b;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-container input:focus { border-color: #0892d0; }

    .clock-icon {
      position: absolute;
      right: 15px;
      width: 18px;
      height: 18px;
      color: #64748b;
      pointer-events: none;
    }

    .days-selector {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .day-chip {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #e2e8f0;
      background: white;
      color: #64748b;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .day-chip.selected {
      background: #0892d0;
      border-color: #0892d0;
      color: white;
      box-shadow: 0 4px 6px -1px rgba(8, 146, 208, 0.3);
    }

    .form-footer {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }

    .save-btn {
      background-color: #0892d0;
      color: white;
      border: none;
      padding: 12px 35px;
      border-radius: 30px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .save-btn:hover { transform: translateY(-2px); background-color: #0369a1; }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    /* Alarms List */
    .alarms-list-section h2 { font-size: 20px; color: #1e293b; margin: 0 0 20px; }
    
    .alarms-list { display: flex; flex-direction: column; gap: 15px; }

    .alarm-row {
      background: white;
      padding: 20px 24px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .alarm-time {
      font-size: 24px;
      font-weight: 800;
      color: #0892d0;
      min-width: 80px;
    }

    .alarm-info { flex: 1; }
    .alarm-info h3 { margin: 0; font-size: 16px; color: #1e293b; }
    .alarm-info p { margin: 2px 0 5px; color: #64748b; font-size: 14px; }
    .alarm-days { font-size: 12px; font-weight: 600; color: #94a3b8; }

    .alarm-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;
    }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .slider {
      position: absolute; cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #cbd5e1;
      transition: .4s; border-radius: 34px;
    }
    .slider:before {
      position: absolute; content: "";
      height: 16px; width: 16px; left: 3px; bottom: 3px;
      background-color: white; transition: .4s; border-radius: 50%;
    }
    input:checked + .slider { background-color: #0892d0; }
    input:checked + .slider:before { transform: translateX(22px); }

    .delete-btn {
      background: none; border: none; color: #ef4444;
      cursor: pointer; padding: 5px; border-radius: 50%;
      transition: background 0.2s;
    }
    .delete-btn:hover { background: #fef2f2; }
    .delete-btn svg { width: 20px; height: 20px; }

    .empty-state { text-align: center; padding: 40px; color: #64748b; font-style: italic; }
    .loading-state { text-align: center; padding: 40px; color: #64748b; }

    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
      .alarm-row { flex-direction: column; align-items: flex-start; gap: 15px; }
      .alarm-actions { width: 100%; justify-content: space-between; border-top: 1px solid #f1f5f9; pt: 15px; padding-top: 15px;}
    }
  `
})
export class MedicationAlarmsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reminderService = inject(ReminderService);
  private authService = inject(AuthService);

  days = [
    { key: 'L', label: 'L' },
    { key: 'M', label: 'M' },
    { key: 'X', label: 'M' },
    { key: 'J', label: 'J' },
    { key: 'V', label: 'V' },
    { key: 'S', label: 'S' },
    { key: 'D', label: 'D' }
  ];

  alarmForm: FormGroup = this.fb.group({
    medicationName: ['', Validators.required],
    purpose: ['', Validators.required],
    reminderTime: ['08:00', Validators.required]
  });

  selectedDays = signal<string[]>([]);
  medicationAlarms = signal<ReminderResponseDTO[]>([]);
  
  isLoading = signal(true);
  isSaving = signal(false);

  ngOnInit() {
    this.loadAlarms();
  }

  loadAlarms() {
    const user = this.authService.currentUser();
    if (user?.profileId) {
      this.reminderService.getRemindersByPatient(user.profileId).subscribe({
        next: (data) => {
          this.medicationAlarms.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false)
      });
    }
  }

  toggleDay(day: string) {
    const current = this.selectedDays();
    if (current.includes(day)) {
      this.selectedDays.set(current.filter(d => d !== day));
    } else {
      this.selectedDays.set([...current, day]);
    }
  }

  saveAlarm() {
    const user = this.authService.currentUser();
    if (this.alarmForm.valid && this.selectedDays().length > 0 && user?.profileId) {
      this.isSaving.set(true);
      const request = {
        patientId: user.profileId,
        ...this.alarmForm.value,
        frequency: this.selectedDays().join(','),
        reminderTime: this.alarmForm.value.reminderTime
      };

      this.reminderService.createReminder(request).subscribe({
        next: (newAlarm) => {
          this.medicationAlarms.update(alarms => [...alarms, newAlarm]);
          this.resetForm();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false)
      });
    }
  }

  toggleAlarm(alarm: ReminderResponseDTO) {
    this.reminderService.toggleReminder(alarm.reminderId).subscribe({
      next: (updated) => {
        this.medicationAlarms.update(alarms => 
          alarms.map(a => a.reminderId === updated.reminderId ? updated : a)
        );
      }
    });
  }

  deleteAlarm(id: number) {
    if (confirm('¿Estás seguro de eliminar esta alarma?')) {
      this.reminderService.deleteReminder(id).subscribe({
        next: () => {
          this.medicationAlarms.update(alarms => alarms.filter(a => a.reminderId !== id));
        }
      });
    }
  }

  resetForm() {
    this.alarmForm.reset({ reminderTime: '08:00' });
    this.selectedDays.set([]);
  }

  formatFrequency(freq: string): string {
    return freq.split(',').join(', ');
  }
}
