import api from './api';
import { RendezVous } from './types';

export interface RendezVousFilters {
  devis?: number | string;
  client?: number | string;
  statut?: string;
}

export async function fetchRendezVousList(filters?: RendezVousFilters): Promise<RendezVous[]> {
  const res = await api.get('/rendezvous/', { params: filters });
  return res.data;
}

export async function fetchRendezVous(id: number | string): Promise<RendezVous> {
  const res = await api.get(`/rendezvous/${id}/`);
  return res.data;
}

export interface CreateRendezVousPayload {
  client: number | string;
  devis?: number | string | null;
  date_rdv: string;
  heure_rdv: string;
  type_rdv: string;
  notes?: string;
}

export async function createRendezVous(data: CreateRendezVousPayload): Promise<RendezVous> {
  const res = await api.post('/rendezvous/', data);
  return res.data;
}

export async function confirmerRendezVous(id: number | string): Promise<RendezVous> {
  const res = await api.post(`/rendezvous/${id}/confirmer/`);
  return res.data.rendez_vous ?? res.data;
}

export async function annulerRendezVous(id: number | string): Promise<RendezVous> {
  const res = await api.post(`/rendezvous/${id}/annuler/`);
  return res.data;
}

export async function terminerRendezVous(id: number | string): Promise<RendezVous> {
  const res = await api.post(`/rendezvous/${id}/terminer/`);
  return res.data;
}
