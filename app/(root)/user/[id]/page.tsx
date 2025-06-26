import { notFound } from "next/navigation";
import { UserProfileClient } from "@/components/user-profile-client";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  return <UserProfileClient userId={id} />;
}

export async function generateMetadata({ params }: UserPageProps) {
  const { id } = await params;

  return {
    title: `Kullanıcı Profili - JURNALİZE`,
    description: `${id} kullanıcısının profil sayfası`,
  };
}
