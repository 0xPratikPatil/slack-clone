import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.channels)['update-channel']['$post']>;
type RequestType = InferRequestType<(typeof client.api.channels)['update-channel']['$post']>;

export const useUpdateChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.channels['update-channel']['$post']({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong while updating channel');
    },
  });

  return mutation;
};
