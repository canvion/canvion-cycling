import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StravaAuthUrl, StravaSyncResponse } from '../../models/strava.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StravaService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Obtener la URL de autorización de Strava
  getAuthUrl(): Observable<StravaAuthUrl> {
    return this.http.get<StravaAuthUrl>(`${this.apiUrl}/strava/connect`);
  }

  // Sincronizar actividades de Strava
  syncActivities(): Observable<StravaSyncResponse> {
    return this.http.post<StravaSyncResponse>(`${this.apiUrl}/strava/sync`, {});
  }

  // Desconectar Strava
  disconnect(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/strava/disconnect`, {});
  }
}
