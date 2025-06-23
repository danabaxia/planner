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

        const mapping = await NotionMappingService.getMapping(
          session.user.id,
          databaseId
        );

        if (!mapping) {
          return res.status(404).json({ error: 'Mapping not found' });
        }

        return res.status(200).json(mapping);
      }

      case 'POST': {
        const { databaseId, mapping } = req.body;

        if (!databaseId || !mapping) {
          return res.status(400).json({ error: 'Database ID and mapping are required' });
        }

        const savedMapping = await NotionMappingService.saveMapping(
          session.user.id,
          databaseId,
          mapping
        );

        return res.status(200).json(savedMapping);
      }

      case 'DELETE': {
        const { databaseId } = req.query;

        if (!databaseId || typeof databaseId !== 'string') {
          return res.status(400).json({ error: 'Database ID is required' });
        }

        await NotionMappingService.deleteMapping(
          session.user.id,
          databaseId
        );

        return res.status(200).json({ message: 'Mapping deleted successfully' });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('Error in notion/mapping:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 