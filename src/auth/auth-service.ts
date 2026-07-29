import { api } from "../api/axios";
import type { LoginResponse } from "./auth-types";
import { RegisterRequest } from "./register-request";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {

  const response = await api.post<LoginResponse>(
    "/auth/login",
    {
      email,
      password,
    }
  );

  return response.data;
}

export async function register(
    request: RegisterRequest
): Promise<void> {

    await api.post(
        "/auth/register",
        request
    );

}