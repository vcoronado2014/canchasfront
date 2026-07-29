export interface User {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  rol: string;
  clubId?: number;
}

export interface Club {
  id: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  regionCodigo?: string;
  regionNombre?: string;
  comunaCodigo?: string;
  comunaNombre?: string;
  latitud?: number;
  longitud?: number;
  fotoPrincipalUrl?: string;
  descripcion?: string;
  subdominio: string;
  estadoSuscripcion: string;
  fechaProxVencimiento?: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
}

export interface LoginResponse {
    token: string;
    tipo: "Staff" | "Cliente";

    user?: User;
    club?: Club;

    cliente?: Cliente;
}

export interface AuthContextType {

    token: string | null;

    tipo?: string;

    user?: User;

    club?: Club;

    cliente?: Cliente;

    isAuthenticated: boolean;

    login(
        email: string,
        password: string
    ): Promise<LoginResponse>;

    logout(): void;
}