import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { InferResponseType } from "hono";
import { InferRequestType } from "hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.workspaces["new-join-code"]["$post"]>
type RequestType = InferRequestType<typeof client.api.workspaces["new-join-code"]["$post"]>

export const useNewJoinCode = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.workspaces["new-join-code"]["$post"]({ json })
            return await response.json()
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["workspaces"] });
            toast.success(response.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong while generating join code");
        },  
    })

    return mutation
}
