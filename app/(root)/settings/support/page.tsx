import { getSession } from "@/components/auth/get-session";
import { redirect } from "next/navigation";
import TicketListPage from "@/components/settings/ticket-list-page";
import { useFetchTicket } from "@/features/support/api/use-fetch-tickets";

const TicketsPage = async () => {
  const session = await getSession();
  if (!session) return redirect("/login");
  const tickets = await useFetchTicket(session);
  return <TicketListPage session={session} tickets={tickets.data} />;
};

export default TicketsPage;
