import { useQuery } from '@tanstack/react-query';
import { moderatorsApi } from '@shared/api/moderatorsApi';

const MODERATOR_ME_KEY = 'moderator-me';

export const useCurrentModerator = () =>
  useQuery({
    queryKey: [MODERATOR_ME_KEY],
    queryFn: () => moderatorsApi.getCurrentModerator()
  });


