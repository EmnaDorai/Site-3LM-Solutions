export interface Client {
  id: number | string;
  nom: string;
  entreprise?: string;
  email: string;
}

export interface LigneDevis {
  id?: number | string;
  description: string;
  quantite: number;
  prix_unitaire: number | string;
  total?: number | string;
}

export interface Devis {
  id: number;
  client_nom?: string;
  besoins_client: string;
  synthese_ia?: string;
  statut: 'brouillon' | 'valide' | 'envoye';
  date_creation: string;
  estimation_montant?: number | string | null;
  lignes?: LigneDevis[];
}
