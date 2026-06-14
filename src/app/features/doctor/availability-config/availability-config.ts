import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AvailabilityService, TimeSlotRequest } from '../../../core/services/availability.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-availability-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [DatePipe],
  template: `
    <div class="availability-view">
      <header class="view-header">
        <h1>Configurar Horarios de Atención</h1>
        <p>Define tus rangos horarios disponibles para los próximos 3 días.</p>
      </header>

      <form [formGroup]="availabilityForm" (ngSubmit)="saveSchedule()" class="main-form">
        <div class="rolling-window-grid" formArrayName="days">
          <!-- Card por cada día -->
          <div *ngFor="let dayControl of dayControls.controls; let i = index" 
               [formGroupName]="i" 
               class="date-card">
            
            <header class="card-header">
              <span class="date-title">{{ displayDates[i].label }}</span>
            </header>

            <div class="slots-container" formArrayName="slots">
              <div *ngFor="let slot of getSlots(i).controls; let j = index" 
                   [formGroupName]="j" 
                   class="slot-row">
                
                <div class="time-inputs-group">
                  <div class="input-item">
                    <label>INICIO</label>
                    <input type="time" formControlName="startTime">
                  </div>
                  <div class="divider">a</div>
                  <div class="input-item">
                    <label>FIN</label>
                    <input type="time" formControlName="endTime">
                  </div>
                </div>

                <button type="button" (click)="removeSlot(i, j)" class="delete-btn" title="Eliminar bloque">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>

                <!-- Validación de duración -->
                <div class="error-msg" *ngIf="slot.errors?.['durationError'] && (slot.touched || slot.dirty)">
                  {{ slot.errors?.['durationError'] }}
                </div>
              </div>

              <!-- Empty State del Card -->
              <div class="empty-slots" *ngIf="getSlots(i).length === 0">
                Sin bloques definidos.
              </div>

              <button type="button" (click)="addSlot(i)" class="add-slot-btn">
                + Añadir nuevo bloque disponible
              </button>
            </div>
          </div>
        </div>

        <div class="feedback-section">
          <div class="backend-error" *ngIf="errorMessage()">{{ errorMessage() }}</div>
          <div class="backend-success" *ngIf="successMessage()">{{ successMessage() }}</div>
        </div>

        <footer class="form-footer">
          <button type="submit" class="save-btn" [disabled]="availabilityForm.invalid || isSaving()">
            {{ isSaving() ? 'Guardando...' : 'Guardar Horarios' }}
          </button>
        </footer>
      </form>
    </div>
  `,
  styles: `
    .availability-view {
      display: flex;
      flex-direction: column;
      gap: 30px;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      min-width: 0;
    }

    .view-header h1 { font-size: 28px; color: #1e293b; margin: 0; }
    .view-header p { color: #64748b; margin: 5px 0 0; }

    .rolling-window-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      width: 100%;
      box-sizing: border-box;
    }

    .date-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .card-header {
      background: #f8fafc;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
      text-align: center;
    }

    .date-title {
      font-size: 16px;
      font-weight: 700;
      color: #0892d0;
      text-transform: capitalize;
    }

    .slots-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      flex: 1;
    }

    .slot-row {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 15px;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      position: relative;
    }

    .time-inputs-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .input-item {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .input-item label {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      margin-bottom: 4px;
    }

    .input-item input {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 14px;
      color: #1e293b;
      font-weight: 600;
      outline: none;
      width: 100%;
      box-sizing: border-box;
    }

    .input-item input:focus {
      border-color: #0892d0;
    }

    .divider {
      margin-top: 15px;
      font-size: 12px;
      color: #94a3b8;
    }

    .delete-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      background: #ef4444;
      color: white;
      border: none;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .delete-btn:hover { transform: scale(1.1); }
    .delete-btn svg { width: 14px; height: 14px; }

    .add-slot-btn {
      background: transparent;
      border: 2px dashed #0892d0;
      color: #0892d0;
      padding: 12px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 10px;
    }

    .add-slot-btn:hover { background: #f0f9ff; }

    .empty-slots {
      text-align: center;
      color: #94a3b8;
      font-size: 13px;
      font-style: italic;
      padding: 10px 0;
    }

    .error-msg {
      color: #ef4444;
      font-size: 11px;
      font-weight: 600;
      text-align: center;
    }

    .feedback-section { margin-top: 20px; }

    .backend-error {
      background-color: #fef2f2;
      color: #dc2626;
      padding: 12px;
      border-radius: 12px;
      font-size: 14px;
      text-align: center;
      border: 1px solid #fee2e2;
    }

    .backend-success {
      background-color: #f0fdf4;
      color: #166534;
      padding: 12px;
      border-radius: 12px;
      font-size: 14px;
      text-align: center;
      border: 1px solid #dcfce7;
    }

    .form-footer {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }

    .save-btn {
      background-color: #0892d0;
      color: white;
      border: none;
      padding: 14px 40px;
      border-radius: 30px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(8, 146, 208, 0.3);
      transition: all 0.2s;
    }

    .save-btn:hover { background-color: #0369a1; transform: translateY(-2px); }
    .save-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

    @media (max-width: 1100px) {
      .rolling-window-grid { grid-template-columns: 1fr; }
    }
  `
})
export class AvailabilityConfigComponent implements OnInit {
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);
  private availabilityService = inject(AvailabilityService);
  private authService = inject(AuthService);

  displayDates: { date: Date, label: string }[] = [];
  availabilityForm!: FormGroup;
  
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  ngOnInit() {
    this.generateDisplayDates();
    this.initForm();
  }

  private generateDisplayDates() {
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      
      const formatted = this.datePipe.transform(nextDate, "EEEE, dd/MM", '', 'es-ES') || '';
      this.displayDates.push({
        date: nextDate,
        label: formatted.charAt(0).toUpperCase() + formatted.slice(1)
      });
    }
  }

  private initForm() {
    this.availabilityForm = this.fb.group({
      days: this.fb.array(this.displayDates.map(d => this.createDayGroup(d.date)))
    });
  }

  get dayControls() {
    return this.availabilityForm.get('days') as FormArray;
  }

  private createDayGroup(date: Date): FormGroup {
    return this.fb.group({
      date: [date],
      slots: this.fb.array([])
    });
  }

  getSlots(dayIndex: number): FormArray {
    return this.dayControls.at(dayIndex).get('slots') as FormArray;
  }

  addSlot(dayIndex: number) {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const slots = this.getSlots(dayIndex);
    slots.push(this.fb.group({
      startTime: ['09:00', Validators.required],
      endTime: ['11:00', Validators.required]
    }, { validators: this.durationValidator }));
  }

  removeSlot(dayIndex: number, slotIndex: number) {
    this.getSlots(dayIndex).removeAt(slotIndex);
  }

  private durationValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('startTime')?.value;
    const end = control.get('endTime')?.value;

    if (!start || !end) return null;

    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    const diffMinutes = endTotal - startTotal;

    if (diffMinutes < 60) {
      return { durationError: 'Mínimo 1 hora de duración.' };
    }
    if (diffMinutes > 180) {
      return { durationError: 'Máximo 3 horas de duración.' };
    }

    return null;
  }

  isFieldInvalid(form: 'login' | 'register', field: string) {
    const f = (form === 'login' ? this.availabilityForm : this.availabilityForm) as any; // Dummy placeholder for compatibility
    return false; // Specific logic not needed here yet
  }

  private formatErrorMessage(err: any, fallback: string): string {
    let msg = fallback;
    
    if (typeof err.error === 'string') {
      try {
        const parsed = JSON.parse(err.error);
        msg = parsed.message || msg;
      } catch (e) {
        msg = err.error || msg;
      }
    } else if (err.error?.message) {
      msg = err.error.message;
    } else if (err.message) {
      msg = err.message.replace(/Http failure response for .*?: /i, '');
      if (msg.includes('0 Unknown Error')) msg = 'Error de conexión con el servidor';
    }

    return msg;
  }

  saveSchedule() {
    const user = this.authService.currentUser();
    if (this.availabilityForm.valid && user?.profileId) {
      this.isSaving.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);

      const allSlots: TimeSlotRequest[] = [];
      
      this.availabilityForm.value.days.forEach((day: any) => {
        const dateStr = day.date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        day.slots.forEach((slot: any) => {
          allSlots.push({
            startTime: `${dateStr}T${slot.startTime}:00`,
            endTime: `${dateStr}T${slot.endTime}:00`
          });
        });
      });

      if (allSlots.length === 0) {
        this.errorMessage.set('Debes añadir al menos un bloque de horario.');
        this.isSaving.set(false);
        return;
      }

      this.availabilityService.saveAvailabilityBatch({
        doctorId: user.profileId,
        slots: allSlots
      }).subscribe({
        next: () => {
          this.successMessage.set('¡Horarios actualizados exitosamente!');
          this.isSaving.set(false);
        },
        error: (err) => {
          this.errorMessage.set(this.formatErrorMessage(err, 'Error al guardar los horarios. Verifica que no existan cruces.'));
          this.isSaving.set(false);
        }
      });
    }
  }
}
