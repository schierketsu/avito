import { httpClient } from './httpClient';
import type { Moderator } from './types';

export const moderatorsApi = {
  getCurrentModerator: async (): Promise<Moderator> => {
    const { data } = await httpClient.get<Moderator>('/moderators/me');
    return data;
  }
};


