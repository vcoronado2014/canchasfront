import { api } from "src/api/axios";

import type { ClubDetail, ClubListItem, CreateClubPayload, CreateClubResponse, UpdateClubPayload } from "src/types/club";

export async function getClubs(): Promise<ClubListItem[]> {
  const response = await api.get("/Club");

  return response.data;
}

export async function getClubById(id: number): Promise<ClubDetail> {
  const response = await api.get(`/Club/${id}`);
  return response.data;
}

export async function createClub(payload: CreateClubPayload): Promise<CreateClubResponse> {
  const response = await api.post('/Club/crear', payload);
  return response.data;
}

export async function updateClub(id: number, payload: UpdateClubPayload): Promise<void> {
  await api.put(`/Club/${id}`, payload);
}

export async function deleteClub(id: number): Promise<void> {
  await api.delete(`/Club/${id}`);
}