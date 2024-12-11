import { EchoChannel } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetChannelByIdProps {
  channelId: EchoChannel["id"];
}

export const useGetChannelById = ({ channelId }: UseGetChannelByIdProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["channels", channelId],
    queryFn: () => getChannelById(channelId),
  });

  return { data, isLoading };
};

const getChannelById = async (channelId: EchoChannel["id"]) => {
  const response = await client.api.channels["get-by-id"]["$post"]({
    json: { channelId },
  });
  return await response.json();
};
