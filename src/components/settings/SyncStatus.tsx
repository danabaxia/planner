import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { RefreshCw, Clock, AlertCircle } from 'lucide-react';
import { useNotionSync } from '@/hooks/useNotionSync';

export function SyncStatus() {
  const {
    isSyncing,
    lastSyncedAt,
    error,
    selectedDatabases,
    getSyncStatus,
  } = useNotionSync();

  useEffect(() => {
    getSyncStatus();
  }, [getSyncStatus]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Synchronization Status
        </CardTitle>
        <CardDescription>
          Monitor your Notion database synchronization status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Last Synced</p>
                <p className="text-sm text-gray-500">
                  {lastSyncedAt
                    ? new Date(lastSyncedAt).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={getSyncStatus}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          <div>
            <h3 className="font-medium mb-2">Connected Databases</h3>
            {selectedDatabases.length === 0 ? (
              <p className="text-sm text-gray-500">
                No databases selected for synchronization
              </p>
            ) : (
              <ul className="space-y-2">
                {selectedDatabases.map((databaseId) => (
                  <li
                    key={databaseId}
                    className="text-sm p-2 bg-gray-50 rounded-lg"
                  >
                    {databaseId}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 