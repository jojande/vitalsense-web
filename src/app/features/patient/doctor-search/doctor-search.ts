import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DoctorService } from '../../../core/services/doctor.service';
import { DoctorResponse } from '../../../core/models/doctor.models';
import { SPECIALTIES } from '../../auth/auth-page';

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="search-view">
      <header class="search-header">
        <h1>Buscar Personal Médico</h1>
        <p>Encuentra rápidamente al profesional adecuado según tu necesidad.</p>
      </header>

      <div class="filter-section">
        <div class="select-container">
          <select [formControl]="specialtyControl" class="specialty-select">
            <option value="">Selecciona una especialidad...</option>
            <option *ngFor="let s of specialties" [value]="s.value">
              {{ s.label }}
            </option>
          </select>
          <div class="select-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      <div class="results-grid" *ngIf="doctors().length > 0; else noResults">
        <div class="doctor-card" *ngFor="let doc of doctors()">
          <div class="card-body">
            <div class="doc-avatar">
              {{ doc.fullName[0] }}
            </div>
            <div class="doc-info">
              <h3>{{ doc.fullName }}</h3>
              <span class="specialty-badge">{{ formatSpecialty(doc.specialty) }}</span>
              <p class="bio">{{ doc.biography || 'Sin biografía disponible.' }}</p>
              <div class="stats">
                <span><strong>{{ doc.yearsOfExperience }}</strong> años exp.</span>
                <span><strong>\${{ doc.consultationFee }}</strong> consulta</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <button class="primary-btn">Agendar Cita</button>
          </div>
        </div>
      </div>

      <ng-template #noResults>
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="12"></line><line x1="11" y1="14" x2="11" y2="14"></line></svg>
          </div>
          <h3>{{ specialtyControl.value ? 'No se encontraron médicos' : 'Comienza tu búsqueda' }}</h3>
          <p>{{ specialtyControl.value ? 'Intenta con otra especialidad.' : 'Selecciona una especialidad arriba para ver los profesionales disponibles.' }}</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: `
    .search-view {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .search-header h1 { font-size: 28px; color: #1e293b; margin: 0; }
    .search-header p { color: #64748b; margin: 5px 0 0; }

    .filter-section {
      background: white;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    .select-container {
      position: relative;
      max-width: 400px;
    }

    .specialty-select {
      width: 100%;
      padding: 12px 20px;
      padding-right: 45px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: white;
      font-size: 15px;
      color: #1e293b;
      cursor: pointer;
      appearance: none;
      outline: none;
      transition: border-color 0.2s;
    }

    .specialty-select:focus {
      border-color: #0892d0;
    }

    .select-arrow {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      color: #64748b;
      pointer-events: none;
    }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .doctor-card {
      background: white;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .doctor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
    }

    .card-body {
      padding: 24px;
      display: flex;
      gap: 20px;
      flex: 1;
    }

    .doc-avatar {
      width: 60px;
      height: 60px;
      background: #f0f9ff;
      color: #0892d0;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .doc-info { flex: 1; }
    .doc-info h3 { margin: 0; font-size: 18px; color: #1e293b; }

    .specialty-badge {
      display: inline-block;
      background: #f0fdf4;
      color: #166534;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin: 8px 0 12px;
    }

    .bio {
      font-size: 14px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 16px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: flex;
      gap: 15px;
      font-size: 13px;
      color: #475569;
    }

    .card-footer {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }

    .primary-btn {
      width: 100%;
      background: #0892d0;
      color: white;
      border: none;
      padding: 10px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .primary-btn:hover { background: #0369a1; }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 20px;
      border: 2px dashed #e2e8f0;
    }

    .empty-icon {
      width: 64px;
      height: 64px;
      color: #cbd5e1;
      margin: 0 auto 20px;
    }

    .empty-state h3 { color: #1e293b; margin: 0 0 10px; }
    .empty-state p { color: #64748b; max-width: 300px; margin: 0 auto; }
  `
})
export class DoctorSearchComponent {
  private doctorService = inject(DoctorService);

  specialties = SPECIALTIES;
  specialtyControl = new FormControl('');
  doctors = signal<DoctorResponse[]>([]);

  constructor() {
    this.specialtyControl.valueChanges.subscribe(val => {
      if (val) {
        this.doctorService.searchDoctors(val).subscribe({
          next: (data) => this.doctors.set(data),
          error: () => this.doctors.set([])
        });
      } else {
        this.doctors.set([]);
      }
    });
  }

  formatSpecialty(val: string) {
    return this.specialties.find(s => s.value === val)?.label || val;
  }
}
