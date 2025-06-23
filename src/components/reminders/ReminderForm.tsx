'use client';

import { useState } from 'react';
import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/Input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ControllerRenderProps } from 'react-hook-form';
import { toast } from 'sonner';

const reminderSchema = z.object({
  taskId: z.string(),
  reminderTime: z.string(),
  reminderType: z.enum(['push', 'email']),
  message: z.string().optional(),
});

type ReminderFormData = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  taskId: string;
  onSubmit: (data: ReminderFormData) => Promise<void>;
  defaultValues?: Partial<ReminderFormData>;
}

export function ReminderForm({ taskId, onSubmit, defaultValues }: ReminderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isSubscribed, subscribe } = usePushNotifications();

  const form = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      taskId,
      reminderType: 'push',
      ...defaultValues,
    },
  });

  const reminderType = form.watch('reminderType');

  const handleFormSubmit = async (data: ReminderFormData) => {
    try {
      setIsLoading(true);

      if (data.reminderType === 'push' && !isSubscribed) {
        await subscribe();
      }

      await onSubmit(data);
      toast.success('Reminder set successfully');
    } catch (error) {
      console.error('Error setting reminder:', error);
      toast.error('Failed to set reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnooze = async (duration: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reminders/${taskId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });

      if (!response.ok) {
        throw new Error('Failed to snooze reminder');
      }

      toast.success('Reminder snoozed');
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      toast.error('Failed to snooze reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      toast.success('Task completed');
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Set a reminder for task: <span className="font-medium">{taskId}</span>
        </div>

        <FormField
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Reminder Time</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), 'PPp')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date.toISOString());
                      }
                    }}
                    disabled={(date) =>
                      date < new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Input
                      type="time"
                      value={field.value ? format(new Date(field.value), 'HH:mm') : ''}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = field.value ? new Date(field.value) : new Date();
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(newDate.toISOString());
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reminderType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Notification Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="push" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Push Notification
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="email" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Email Notification
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {reminderType === 'push' && !isSubscribed && (
          <Alert className="mt-4">
            <AlertTitle>Push Notifications Not Enabled</AlertTitle>
            <AlertDescription>
              You need to enable push notifications to receive reminders.
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => subscribe()}
                disabled={isLoading}
              >
                {isLoading ? 'Enabling...' : 'Enable Push Notifications'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Message (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Add a custom reminder message" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap gap-2 mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Setting...' : 'Set Reminder'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSnooze(15)}
            disabled={isLoading}
          >
            Snooze 15m
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSnooze(60)}
            disabled={isLoading}
          >
            Snooze 1h
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleComplete}
            disabled={isLoading}
          >
            Complete Task
          </Button>
        </div>
      </form>
    </Form>
  );
} 