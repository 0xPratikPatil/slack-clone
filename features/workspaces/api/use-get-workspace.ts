import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { EchoWorkspace } from "@prisma/client";

export const useGetWorkspaceById = ({ workspaceId }: { workspaceId: EchoWorkspace["id"] }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => getWorkspaceById(workspaceId),
  });

  return { data, isLoading };
};

const getWorkspaceById = async (workspaceId: EchoWorkspace["id"]) => {
  const response = await client.api.workspaces["get-by-id"]["$post"]({
    json: { workspaceId },
  });
  return await response.json();
};
