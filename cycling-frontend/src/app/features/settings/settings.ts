import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ZonesService } from '../../core/services/zona.service';
import { AuthService } from '../../core/services/auth.service';
import { Sidebar } from '../../shared/sidebar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, Sidebar],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {

  maxHeartrate: number = 0;
  isLoading: boolean = true;
  isSaving: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private zonesService: ZonesService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.zonesService.getConfig().subscribe({
      next: (data: any) => {
        this.maxHeartrate = data.maxHeartrate;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando config', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  save(): void {
    if (this.maxHeartrate < 100 || this.maxHeartrate > 220) {
      this.errorMessage = 'La FC máxima debe estar entre 100 y 220 bpm';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.zonesService.saveConfig(this.maxHeartrate).subscribe({
      next: (res: any) => {
        this.successMessage = '✅ FC máxima guardada correctamente';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.errorMessage = '❌ Error al guardar';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
