import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect(cookies().get('token') ? '/notes' : '/login');
}
