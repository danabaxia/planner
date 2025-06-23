import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SyncResult {
  id: string;
  databaseId: string;
  status: 'completed' | 'failed';
  error?: string;
  lastSyncedAt: Date;
  syncInterval?: number;
  nextSyncAt?: Date;
  lastSyncResult?: {
    created: number;
    updated: number;
    deleted: number;
    synced: number;
    errors: string[];
  };
}

interface SyncHistoryProps {
  syncResults: SyncResult[];
  onRefresh: () => void;
  loading?: boolean;
}

export function SyncHistory({ syncResults, onRefresh, loading }: SyncHistoryProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Sync History
            </CardTitle>
            <CardDescription>
              Recent synchronization activities and results
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {syncResults.map((result) => (
              <div
                key={result.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => toggleExpand(result.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {result.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mt-1" />
                    )}
                    <div>
                      <h4 className="font-medium">
                        Database: {result.databaseId}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(result.lastSyncedAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {result.syncInterval && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                          <Clock className="h-3 w-3" />
                          Every {result.syncInterval} minutes
                          {result.nextSyncAt && (
                            <span>
                              (Next:{' '}
                              {formatDistanceToNow(new Date(result.nextSyncAt), {
                                addSuffix: true,
                              })}
                              )
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    {result.lastSyncResult && (
                      <div className="text-right">
                        <span className="font-medium">
                          {result.lastSyncResult.synced} items
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {expandedResults.has(result.id) && result.lastSyncResult && (
                  <div className="mt-4 pl-8">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p className="font-medium">
                          {result.lastSyncResult.created}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Updated</p>
                        <p className="font-medium">
                          {result.lastSyncResult.updated}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Deleted</p>
                        <p className="font-medium">
                          {result.lastSyncResult.deleted}
                        </p>
                      </div>
                    </div>

                    {result.lastSyncResult.errors.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-red-500 mb-2">
                          Errors ({result.lastSyncResult.errors.length})
                        </p>
                        <ul className="text-sm text-red-500 space-y-1">
                          {result.lastSyncResult.errors.map((error, index) => (
                            <li key={index} className="ml-4 list-disc">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 