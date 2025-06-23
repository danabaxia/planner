import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Database, RefreshCw, Check } from 'lucide-react';
import { useNotionSync } from '@/hooks/useNotionSync';
import type { NotionDatabase } from '@/types/notion';

interface DatabaseSelectorProps {
  databases: NotionDatabase[];
  selectedDatabases: string[];
  onSelect: (databaseId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function DatabaseSelector({
  databases,
  selectedDatabases,
  onSelect,
  onRefresh,
  loading,
}: DatabaseSelectorProps) {
  const {
    isSyncing,
    lastSyncedAt,
    error: syncError,
    syncDatabase,
    getSyncStatus,
  } = useNotionSync();

  useEffect(() => {
    getSyncStatus();
  }, [getSyncStatus]);

  const handleSync = async (databaseId: string) => {
    const result = await syncDatabase(databaseId);
    if (result) {
      // Show success message or update UI
      console.log('Sync completed:', result);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Available Databases
        </CardTitle>
        <CardDescription>
          Select databases to sync with your planner
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : databases.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No databases found
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {lastSyncedAt && (
                <span className="text-sm text-gray-500">
                  Last synced: {new Date(lastSyncedAt).toLocaleString()}
                </span>
              )}
            </div>
            {syncError && (
              <div className="text-sm text-red-500 mb-4">
                {syncError}
              </div>
            )}
            <div className="grid gap-4">
              {databases.map(database => {
                const isSelected = selectedDatabases.includes(database.id);
                return (
                  <div
                    key={database.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">
                        {database.title[0]?.text.content || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {database.description?.[0]?.text.content || 'No description'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onSelect(database.id)}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Selected
                          </>
                        ) : (
                          'Select'
                        )}
                      </Button>
                      {isSelected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(database.id)}
                          disabled={isSyncing}
                        >
                          {isSyncing ? (
                            <>
                              <Spinner className="h-4 w-4 mr-2" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Sync
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 