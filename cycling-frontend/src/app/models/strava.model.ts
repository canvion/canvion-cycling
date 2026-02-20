// Respuesta al pedir la URL de Strava
export interface StravaAuthUrl {
  authorizationUrl: string;
}

// Respuesta al sincronizar
export interface StravaSyncResponse {
  message: string;
  newActivitiesCount: number;
}
