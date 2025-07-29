import OrganizationClient from './OrganizationClient';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchOrgList(isIam = false) {
  const cookieStore = cookies();
  const session = cookieStore.get('ory_kratos_session');
  if (!session) throw new Error('Unauthorized');

  const endpoint = isIam ? '/organization/user/list' : '/organization/list';
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { Cookie: `ory_kratos_session=${session.value}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error(`Org fetch failed: ${res.status}`);
    throw new Error('Failed to load organizations');
  }

  const data = await res.json();
  return data.organizations || [];
}

export default async function OrganizationPage({ isIam }) {
  let organizations = [];

  try {
    organizations = await fetchOrgList(isIam);
  } catch (error) {
    console.error('Error loading organizations:', error);
  }

  return (
    <OrganizationClient organizations={organizations} isIam={isIam} />
  );
}
