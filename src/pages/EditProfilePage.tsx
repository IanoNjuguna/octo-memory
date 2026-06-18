import { useSeoMeta } from '@unhead/react';
import { EditProfileForm } from '@/components/EditProfileForm';

export default function EditProfilePage() {
  useSeoMeta({ title: 'Edit Profile — ZapQR' });
  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 md:py-12 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
      <EditProfileForm />
    </div>
  );
}