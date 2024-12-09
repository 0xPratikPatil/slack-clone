import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useGetWorkspaces = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getWorkspaces(),
  });

  return { data, isLoading };
};

const getWorkspaces = async () => {
  const response = await client.api.workspaces["get-all"]["$post"]({
    json: {},
  });
  return await response.json();
};
