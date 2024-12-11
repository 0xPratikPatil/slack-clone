import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InferRequestType, InferResponseType } from 'hono';
import { toast } from 'sonner';

import { client } from '@/lib/rpc';

type ResponseType = InferResponseType<(typeof client.api.channels)['create-channel']['$post']>;
type RequestType = InferRequestType<(typeof client.api.channels)['create-channel']['$post']>;

export const useCreateChannel = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.channels['create-channel']['$post']({ json });
      return await response.json();
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(response.message);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Something went wrong while creating channel');
    },
  });

  return mutation;
};
