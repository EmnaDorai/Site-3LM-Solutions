import api from './api';
import { Devis, LigneDevis } from './types';

export function parseMontant(value: string | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'string' ? parseFloat(value) : value;
}

export function formatMontant(value: string | number | null | undefined): string {
  const n = parseMontant(value);
  if (!n) return '—';
  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `${formatted} DT`;
}

export function calcTotalLignes(lignes: LigneDevis[]): number {
  return lignes.reduce(
    (sum, l) => sum + (l.total ?? l.quantite * parseMontant(l.prix_unitaire)),
    0
  );
}

export async function fetchDevis(id: number | string): Promise<Devis> {
  const res = await api.get(`/devis/${id}/`);
  return res.data;
}

export async function genererDevisIA(
  id: number | string,
  instructions?: string
): Promise<Devis> {
  const res = await api.post(`/devis/${id}/generer_ia/`, {
    instructions: instructions ?? '',
  });
  return res.data;
}

export async function validerDevis(id: number | string): Promise<Devis> {
  const res = await api.post(`/devis/${id}/valider/`);
  return res.data.devis;
}

export async function updateDevis(
  id: number | string,
  data: Partial<Pick<Devis, 'besoins_client' | 'synthese_ia' | 'estimation_montant'>> & {
    lignes?: LigneDevis[];
  }
): Promise<Devis> {
  const res = await api.patch(`/devis/${id}/`, data);
  return res.data;
}

export async function telechargerPdfDevis(id: number | string): Promise<void> {
  const res = await api.get(`/devis/${id}/pdf/`, { responseType: 'blob' });

  const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `devis_${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}