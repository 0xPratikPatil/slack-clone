import { EchoMember } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMembersProps {
  workspaceId: EchoMember["workspaceId"];
}

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembers(workspaceId),
  });

  return { data, isLoading };
};

const getMembers = async (workspaceId: EchoMember["workspaceId"]) => {
  const response = await client.api.members["get-all"]["$post"]({
    json: { workspaceId },
  });
  return await response.json();
};
