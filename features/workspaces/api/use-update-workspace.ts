import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono"
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.workspaces["update-workspace"]["$patch"]>
type RequestType = InferRequestType<typeof client.api.workspaces["update-workspace"]["$patch"]>

export const useUpdateWorkspace = () => {
    const queryClient = useQueryClient()
    const mutation = useMutation<ResponseType, Error, RequestType>({
        mutationFn: async ({ json }) => {
            const response = await client.api.workspaces["update-workspace"]["$patch"]({ json })
            return await response.json()
        },
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success(response.message);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Something went wrong while updating workspace");
        },
    })

    return mutation
} 