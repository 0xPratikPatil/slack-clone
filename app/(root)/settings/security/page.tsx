import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SettingsSecurityPage from "@/components/settings/security-page";

const SecurityPage = async () => {
  const [session, activeSessions] = await Promise.all([
    auth.api.getSession({
      headers: await headers(),
    }),
    auth.api.listSessions({
      headers: await headers(),
    }),
  ]).catch(() => {
    throw redirect("/login");
  });
  if (!session || !activeSessions) return redirect("/login");
  return (
    <SettingsSecurityPage
      session={JSON.parse(JSON.stringify(session))}
      activeSessions={JSON.parse(JSON.stringify(activeSessions))}
    />
  );
};
export default SecurityPage;
