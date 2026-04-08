import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Task } from '@prisma/client';

export function useActivityFeed() {
  const { data: tasks = [], isLoading, error, refetch } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await axios.get('/api/tasks');
      return response.data;
    },
    refetchInterval: 3000,
  });

  return { tasks, isLoading, error, refetch };
}
