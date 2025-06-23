import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import type { NotionDatabase, SchemaMapping } from '@/types/notion';
import { validateSchemaMapping } from '@/lib/notion/schema';

interface UseNotionSyncOptions {
  onSyncComplete?: () => void;
  onSyncError?: (error: Error) => void;
}

interface SyncState {
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: Error | null;
}

export function useNotionSync(options: UseNotionSyncOptions = {}) {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncedAt: null,
    error: null,
  });

  const saveSchemaMapping = useCallback(
    async (databaseId: string, mapping: SchemaMapping) => {
      try {
        const response = await fetch('/api/notion/mapping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ databaseId, mapping }),
        });

        if (!response.ok) {
          throw new Error('Failed to save schema mapping');
        }

        toast.success('Schema mapping saved successfully');
      } catch (error) {
        console.error('Error saving schema mapping:', error);
        toast.error('Failed to save schema mapping');
        throw error;
      }
    },
    []
  );

  const startSync = useCallback(
    async (databaseId: string) => {
      try {
        setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));

        const response = await fetch('/api/notion/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ databaseId }),
        });

        if (!response.ok) {
          throw new Error('Failed to start sync');
        }

        const data = await response.json();
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date(),
        }));

        toast.success('Sync completed successfully');
        options.onSyncComplete?.();

        return data;
      } catch (error) {
        console.error('Error during sync:', error);
        const syncError = error instanceof Error ? error : new Error('Unknown error during sync');
        
        setSyncState((prev) => ({
          ...prev,
          isSyncing: false,
          error: syncError,
        }));

        toast.error('Sync failed');
        options.onSyncError?.(syncError);
        throw syncError;
      }
    },
    [options]
  );

  const checkSyncStatus = useCallback(async (databaseId: string) => {
    try {
      const response = await fetch(`/api/notion/sync/status?databaseId=${databaseId}`);
      
      if (!response.ok) {
        throw new Error('Failed to check sync status');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking sync status:', error);
      throw error;
    }
  }, []);

  const fetchDatabases = useCallback(async () => {
    try {
      const response = await fetch('/api/notion/databases');
      
      if (!response.ok) {
        throw new Error('Failed to fetch databases');
      }

      const data = await response.json();
      return data as NotionDatabase[];
    } catch (error) {
      console.error('Error fetching databases:', error);
      throw error;
    }
  }, []);

  return {
    syncState,
    startSync,
    checkSyncStatus,
    saveSchemaMapping,
    fetchDatabases,
  };
} 