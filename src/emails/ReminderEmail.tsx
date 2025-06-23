import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { format } from 'date-fns';

interface ReminderEmailProps {
  taskTitle: string;
  taskDescription?: string;
  reminderMessage?: string;
  dueDate?: Date;
}

export function ReminderEmail({
  taskTitle,
  taskDescription,
  reminderMessage,
  dueDate,
}: ReminderEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reminder: {taskTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Task Reminder</Heading>
          <Section style={section}>
            <Heading as="h2" style={h2}>
              {taskTitle}
            </Heading>
            {taskDescription && (
              <Text style={text}>{taskDescription}</Text>
            )}
            {reminderMessage && (
              <Text style={text}>
                <strong>Message:</strong> {reminderMessage}
              </Text>
            )}
            {dueDate && (
              <Text style={text}>
                <strong>Due:</strong> {format(dueDate, 'PPp')}
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const section = {
  padding: '0 48px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '48px 0',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#444',
  fontSize: '20px',
  fontWeight: '500',
  lineHeight: '1.4',
  margin: '16px 0',
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '12px 0',
}; 