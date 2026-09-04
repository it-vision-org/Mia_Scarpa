import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@shoestore/db";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/account/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, email: true },
  });

  if (!user) redirect("/account/login");

  const parts = user.name.trim().split(/\s+/);
  const initialFirstName = parts.shift() ?? "";
  const initialLastName = parts.join(" ");

  return (
    <ProfileForm
      initialFirstName={initialFirstName}
      initialLastName={initialLastName}
      email={user.email}
    />
  );
}
