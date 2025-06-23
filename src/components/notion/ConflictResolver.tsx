import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import type { SyncConflict, ConflictResolution, ConflictResolutionStrategy } from '@/lib/notion/sync';

interface ConflictResolverProps {
  conflicts: SyncConflict[];
  onResolve: (resolutions: ConflictResolution[]) => void;
  onCancel: () => void;
}

export function ConflictResolver({ conflicts, onResolve, onCancel }: ConflictResolverProps) {
  const [resolutions, setResolutions] = useState<Record<string, ConflictResolution>>({});

  const handleResolutionChange = (
    conflict: SyncConflict,
    strategy: ConflictResolutionStrategy
  ) => {
    const resolvedValue = strategy === 'notion'
      ? conflict.notionValue
      : strategy === 'local'
      ? conflict.localValue
      : strategy === 'latest'
      ? (new Date(conflict.notionUpdatedAt) > new Date(conflict.localUpdatedAt)
          ? conflict.notionValue
          : conflict.localValue)
      : conflict.localValue;

    setResolutions((prev) => ({
      ...prev,
      [conflict.taskId]: {
        taskId: conflict.taskId,
        notionId: conflict.notionId,
        field: conflict.field,
        resolvedValue,
        strategy,
      },
    }));
  };

  const handleSubmit = () => {
    onResolve(Object.values(resolutions));
  };

  const allResolved = conflicts.every((conflict) => resolutions[conflict.taskId]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          Resolve Sync Conflicts
        </CardTitle>
        <CardDescription>
          {conflicts.length} conflicts found. Please choose how to resolve each conflict.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {conflicts.map((conflict) => (
            <div
              key={`${conflict.taskId}-${conflict.field}`}
              className="p-4 border rounded-lg space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Field: {conflict.field}</h4>
                  <p className="text-sm text-gray-500">Task ID: {conflict.taskId}</p>
                </div>
                {resolutions[conflict.taskId] && (
                  <Check className="h-5 w-5 text-green-500" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Local Value:</p>
                  <p className="text-gray-600">{String(conflict.localValue)}</p>
                  <p className="text-xs text-gray-400">
                    Updated: {new Date(conflict.localUpdatedAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Notion Value:</p>
                  <p className="text-gray-600">{String(conflict.notionValue)}</p>
                  <p className="text-xs text-gray-400">
                    Updated: {new Date(conflict.notionUpdatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <RadioGroup
                value={resolutions[conflict.taskId]?.strategy}
                onValueChange={(value: string) =>
                  handleResolutionChange(
                    conflict,
                    value as ConflictResolutionStrategy
                  )
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="notion" id={`notion-${conflict.taskId}`} />
                  <Label htmlFor={`notion-${conflict.taskId}`}>Use Notion value</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id={`local-${conflict.taskId}`} />
                  <Label htmlFor={`local-${conflict.taskId}`}>Use local value</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="latest" id={`latest-${conflict.taskId}`} />
                  <Label htmlFor={`latest-${conflict.taskId}`}>Use latest value</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id={`manual-${conflict.taskId}`} />
                  <Label htmlFor={`manual-${conflict.taskId}`}>Resolve manually</Label>
                </div>
              </RadioGroup>
            </div>
          ))}

          <div className="flex justify-end space-x-4 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!allResolved}
            >
              Apply Resolutions
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 