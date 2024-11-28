'use client';

import { EchoWorkspace } from '@prisma/client';
import { useParams } from 'next/navigation';

type WorkspaceIdParams = {
  workspaceId: EchoWorkspace['id'];
};

export const useWorkspaceId = () => {
  const params = useParams<WorkspaceIdParams>();

  return params.workspaceId;
};
