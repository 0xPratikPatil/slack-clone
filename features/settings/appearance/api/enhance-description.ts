import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.settings.appearance.enhance)["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.settings.appearance.enhance)["$post"]
>;

export const enhanceDescription = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.settings.appearance.enhance.$post({
        json,
      });
      return await response.json();
    },
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  return mutation;
};
