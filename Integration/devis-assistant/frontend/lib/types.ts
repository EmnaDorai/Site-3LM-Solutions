export interface Client {
  id: number;
  nom: string;
  prenom?: string;
  entreprise?: string;
  email: string;
  telephone: string;
  date_creation: string;
}

export interface LigneDevis {
  id?: number;
  description: string;
  quantite: number;
  prix_unitaire: number | string;
  total?: number;
}

export interface Devis {
  id: number;
  client: number;
  client_nom?: string;
  besoins_client: string;
  synthese_ia?: string;
  estimation_montant?: number | string | null;
  statut: 'brouillon' | 'en_attente' | 'valide' | 'envoye' | 'refuse';
  lignes: LigneDevis[];
  date_creation: string;
  date_modification?: string;
}

export type TypeRdv = 'appel' | 'visio' | 'sur_site';
export type StatutRdv = 'demande' | 'confirme' | 'annule' | 'termine';

export interface RendezVous {
  id: number;
  client: number;
  client_nom?: string;
  client_entreprise?: string;
  client_telephone?: string;
  client_email?: string;
  devis?: number | null;
  devis_statut?: string | null;
  manager?: number | null;
  date_rdv: string;
  heure_rdv: string;
  type_rdv: TypeRdv;
  statut: StatutRdv;
  notes?: string;
  date_creation: string;
  date_modification?: string;
}