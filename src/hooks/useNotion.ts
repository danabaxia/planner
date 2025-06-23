import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import type { NotionDatabase } from '@/types/notion';

interface UseNotionState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  databases: NotionDatabase[];
  selectedDatabases: string[];
}

export function useNotion() {
  const { data: session } = useSession();
  const [state, setState] = useState<UseNotionState>({
    isConnected: false,
    isLoading: true,
    error: null,
    databases: [],
    selectedDatabases: [],
  });

  const connect = useCallback(() => {
    window.location.href = '/api/notion/oauth';
  }, []);

  const disconnect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch('/api/notion/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disconnect from Notion');
      }

      setState(prev => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        databases: [],
        selectedDatabases: [],
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to disconnect from Notion',
      }));
    }
  }, []);

  const refreshDatabases = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch('/api/notion/databases');

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch databases');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        isLoading: false,
        databases: data.databases || [],
        selectedDatabases: data.selectedDatabases || [],
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch databases',
      }));
    }
  }, [session?.user?.id]);

  const selectDatabase = useCallback(async (databaseId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch('/api/notion/databases/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to select database');
      }

      const data = await response.json();
      setState(prev => ({
        ...prev,
        isLoading: false,
        selectedDatabases: data.selectedDatabases || [],
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to select database',
      }));
    }
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!session?.user?.id) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await fetch('/api/notion/databases');
        if (response.ok) {
          const data = await response.json();
          setState(prev => ({
            ...prev,
            isConnected: true,
            isLoading: false,
            databases: data.databases || [],
            selectedDatabases: data.selectedDatabases || [],
          }));
        } else {
          setState(prev => ({
            ...prev,
            isConnected: false,
            isLoading: false,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          isConnected: false,
          isLoading: false,
        }));
      }
    };

    checkConnection();
  }, [session?.user?.id]);

  return {
    ...state,
    connect,
    disconnect,
    refreshDatabases,
    selectDatabase,
  };
} 