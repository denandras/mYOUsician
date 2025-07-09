import { redirect } from 'next/navigation';

export default function DatabasePage() {
    // Database functionality has been moved to public access
    redirect('/database');
}
