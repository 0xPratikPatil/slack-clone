import { client } from "@/lib/rpc";
import { Session } from "@/types/auth";

export const useFetchTicket = async (session: Session) => {
  try {
    const response = await client.api.support["get-tickets"].$post({
      json: session,
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error;
  }
};
