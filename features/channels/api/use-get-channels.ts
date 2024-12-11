import { EchoWorkspace } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetChannelsProps {
  workspaceId: EchoWorkspace["id"];
}

export const useGetChannels = ({ workspaceId }: UseGetChannelsProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["channels", workspaceId],
    queryFn: () => getChannels(workspaceId),
  });

  return { data, isLoading };
};

const getChannels = async (workspaceId: EchoWorkspace["id"]) => {
  const response = await client.api.channels["get-all"]["$post"]({
    json: { workspaceId },
  });
  return await response.json();
};
