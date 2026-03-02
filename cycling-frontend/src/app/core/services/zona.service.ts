import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZonesService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener FC máxima configurada
  getConfig(): Observable<{ maxHeartrate: number }> {
    return this.http.get<{ maxHeartrate: number }>(`${this.apiUrl}/zones/config`);
  }

  // Guardar FC máxima
  saveConfig(maxHeartrate: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/zones/config`, { maxHeartrate });
  }

  // Zonas de una actividad
  getActivityZones(activityId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/zones/activity/${activityId}`);
  }
}
