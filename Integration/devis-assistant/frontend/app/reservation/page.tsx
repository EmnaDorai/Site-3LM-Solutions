import { redirect } from 'next/navigation';

// Ancienne URL conservée pour compatibilité — redirige vers la page publique définitive.
export default function ReservationRedirect() {
  redirect('/rendez-vous');
}
