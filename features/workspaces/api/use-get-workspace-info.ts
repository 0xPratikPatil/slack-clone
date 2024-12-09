import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { EchoWorkspace } from "@prisma/client";

export const useGetWorkspaceInfo = ({
  workspaceId,
}: {
  workspaceId: EchoWorkspace["id"];
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["workspaces", workspaceId],
    queryFn: () => getWorkspaceInfo(workspaceId),
  });

  return { data, isLoading };
};

const getWorkspaceInfo = async (workspaceId: EchoWorkspace["id"]) => {
  const response = await client.api.workspaces["get-info-id"]["$post"]({
    json: { workspaceId },
  });
  return await response.json();
};
