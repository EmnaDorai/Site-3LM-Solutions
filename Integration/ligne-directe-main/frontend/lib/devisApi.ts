import axios from 'axios';

// Instance axios dédiée au module devis — namespacée pour ne pas
// entrer en conflit avec lib/api.js (fetch-based) du module rendez-vous.
const devisApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
});

export default devisApi;
