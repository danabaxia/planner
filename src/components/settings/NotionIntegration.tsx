import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useNotion } from '@/hooks/useNotion';
import { DatabaseSelector } from './DatabaseSelector';
import { SyncStatus } from './SyncStatus';

export function NotionIntegration() {
  const {
    isConnected,
    isLoading,
    databases,
    selectedDatabases,
    connect,
    disconnect,
    refreshDatabases,
    selectDatabase,
  } = useNotion();

  useEffect(() => {
    if (isConnected) {
      refreshDatabases();
    }
  }, [isConnected, refreshDatabases]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect to Notion</CardTitle>
          <CardDescription>
            Integrate your Notion workspace with the planner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={connect}>
            Connect to Notion
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notion Integration</CardTitle>
          <CardDescription>
            Manage your Notion workspace connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={disconnect}
          >
            Disconnect from Notion
          </Button>
        </CardContent>
      </Card>

      <DatabaseSelector
        databases={databases}
        selectedDatabases={selectedDatabases}
        onSelect={selectDatabase}
        onRefresh={refreshDatabases}
        loading={isLoading}
      />

      <SyncStatus />
    </div>
  );
} 