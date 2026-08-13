import api from './api';
import { Client, StatutClient } from './types';

export interface ClientFilters {
  search?: string;
  statut?: string;
}

export async function fetchClients(filters?: ClientFilters): Promise<Client[]> {
  const res = await api.get('/clients/', { params: filters });
  return res.data;
}

export async function updateClientStatut(id: number | string, statut: StatutClient): Promise<Client> {
  const res = await api.patch(`/clients/${id}/`, { statut });
  return res.data;
}

export async function deleteClient(id: number | string): Promise<void> {
  await api.delete(`/clients/${id}/`);
}
