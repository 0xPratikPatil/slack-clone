import { EchoMessage } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMessageByIdProps {
  messageId: EchoMessage["id"];
}

export const useGetMessageById = ({ messageId }: UseGetMessageByIdProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["messages", messageId],
    queryFn: () => getMessageById(messageId),
  });

  return { data, isLoading };
};

const getMessageById = async (messageId: EchoMessage["id"]) => {
  const response = await client.api.messages["get-by-id"]["$post"]({
    json: { id: messageId },
  });
  return await response.json();
};
