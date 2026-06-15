export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR';
}

export interface UserResponse {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profileId: number;
}
