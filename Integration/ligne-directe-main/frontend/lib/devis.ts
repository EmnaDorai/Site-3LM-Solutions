import devisApi from './devisApi';
import { Devis, LigneDevis } from './devisTypes';

export function parseMontant(value: number | string | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : parseFloat(value) || 0;
}

export function formatMontant(value: number | string | null | undefined): string {
  const n = parseMontant(value);
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;
}

export function calcTotalLignes(lignes: LigneDevis[]): number {
  return lignes.reduce((sum, l) => sum + (parseMontant(l.total) || l.quantite * parseMontant(l.prix_unitaire)), 0);
}

export async function fetchDevis(id: string | number): Promise<Devis> {
  const res = await devisApi.get(`/devis/${id}/`);
  return res.data;
}

export async function genererDevisIA(id: string | number, instructions: string): Promise<Devis> {
  const res = await devisApi.post(`/devis/${id}/generer_ia/`, { instructions });
  return res.data;
}

export async function updateDevis(id: string | number, payload: Partial<Devis>): Promise<Devis> {
  const res = await devisApi.patch(`/devis/${id}/`, payload);
  return res.data;
}

export async function validerDevis(id: string | number): Promise<Devis> {
  const res = await devisApi.post(`/devis/${id}/valider/`);
  return res.data;
}

export async function telechargerPdfDevis(id: string | number): Promise<void> {
  const res = await devisApi.get(`/devis/${id}/pdf/`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `devis-${id}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
