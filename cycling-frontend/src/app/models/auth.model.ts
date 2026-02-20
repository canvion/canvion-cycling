// Lo que enviamos al login
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

// Lo que enviamos al registro
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Lo que nos devuelve el backend al autenticar
export interface AuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  userId: number;
  username: string;
  email: string;
}
