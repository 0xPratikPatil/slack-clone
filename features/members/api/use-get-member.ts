import { EchoMember } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMemberByIdProps {
  id: EchoMember["id"];
}

export const useGetMemberById = ({ id }: UseGetMemberByIdProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["members", id],
    queryFn: () => getMemberById(id),
  });

  return { data, isLoading };
};

const getMemberById = async (id: EchoMember["id"]) => {
  const response = await client.api.members["get-by-id"]["$post"]({
    json: { id },
  });
  return await response.json();
};
