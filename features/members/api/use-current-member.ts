import { EchoWorkspace } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetCurrentMemberProps {
  workspaceId: EchoWorkspace["id"];
}

export const useGetCurrentMember = ({
  workspaceId,
}: UseGetCurrentMemberProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getCurrentMember(workspaceId),
  });

  return { data, isLoading };
};

const getCurrentMember = async (workspaceId: EchoWorkspace["id"]) => {
  const response = await client.api.members["current-member"]["$post"]({
    json: { workspaceId },
  });
  return await response.json();
};
