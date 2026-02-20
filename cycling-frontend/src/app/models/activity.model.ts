// Lo que nos devuelve el backend
export interface Activity {
  id: number;
  userId: number;
  stravaActivityId: number | null;
  name: string;
  type: string;
  startDate: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  averageSpeed: number;
  maxSpeed: number;
  averageHeartrate: number;
  maxHeartrate: number;
  averageWatts: number;
  maxWatts: number;
  summaryPolyline: string;
  description: string;
  calories: number;
  isManual: boolean;
  createdAt: string;
  distanceKm: string;
  duration: string;
  pace: string;
}

// Lo que enviamos al crear/editar
export interface ActivityRequest {
  name: string;
  type: string;
  startDate: string;
  distance: number;
  movingTime: number;
  elapsedTime: number;
  totalElevationGain: number;
  averageSpeed: number;
  maxSpeed: number;
  averageHeartrate: number;
  maxHeartrate: number;
  averageWatts: number;
  maxWatts: number;
  description: string;
  calories: number;
}
