import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/react';
import { authOptions } from '@/lib/auth';
import { NotionMappingService } from '@/services/NotionMappingService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET': {
        const { databaseId } = req.query;

        if (!databaseId || typeof databaseId !== 'string') {
          return res.status(400).json({ error: 'Database ID is required' });
        }

        const status = await NotionMappingService.getSyncStatus(
          session.user.id,
          databaseId
        );

        if (!status) {
          return res.status(404).json({ error: 'Sync status not found' });
        }

        return res.status(200).json(status);
      }

      case 'POST': {
        const { databaseId, status, error } = req.body;

        if (!databaseId || !status) {
          return res.status(400).json({ error: 'Database ID and status are required' });
        }

        const updatedStatus = await NotionMappingService.updateSyncStatus(
          session.user.id,
          databaseId,
          status,
          error
        );

        return res.status(200).json(updatedStatus);
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in notion/sync/status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 