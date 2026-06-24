import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VECTOR_DB_PATH = path.join(__dirname, '..', 'data', 'vector_db.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export interface EmbeddingRecord {
  id: string;
  type: 'salon' | 'service' | 'product' | 'faq' | 'guide';
  text: string;
  embedding: number[];
  metadata?: any;
}

// Ensure data folder exists
const ensureDataFolder = () => {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Generates 768-dimension vector embedding using text-embedding-004 model
export async function getEmbedding(text: string): Promise<number[]> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    console.warn('⚠️ Missing GEMINI_API_KEY in environment. Returning mock vector.');
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Embedding API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();
    if (data.embedding && data.embedding.values) {
      return data.embedding.values;
    }
    throw new Error('Unexpected response format from embedding API.');
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Fallback to random vector to prevent server crash
    return Array.from({ length: 768 }, () => Math.random() - 0.5);
  }
}

// Computes cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Local File-Based Vector Database implementation (Fallback Mode)
class LocalVectorDatabase {
  private records: EmbeddingRecord[] = [];

  constructor() {
    this.load();
  }

  load() {
    ensureDataFolder();
    if (fs.existsSync(VECTOR_DB_PATH)) {
      try {
        const fileContent = fs.readFileSync(VECTOR_DB_PATH, 'utf-8');
        this.records = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse local vector DB, resetting:', err);
        this.records = [];
      }
    } else {
      this.records = [];
      this.save();
    }
  }

  save() {
    ensureDataFolder();
    fs.writeFileSync(VECTOR_DB_PATH, JSON.stringify(this.records, null, 2), 'utf-8');
  }

  upsert(record: EmbeddingRecord) {
    const idx = this.records.findIndex((r) => r.id === record.id && r.type === record.type);
    if (idx >= 0) {
      this.records[idx] = record;
    } else {
      this.records.push(record);
    }
    this.save();
  }

  search(queryVector: number[], type?: string, limit = 5): { id: string; type: string; score: number; text: string; metadata?: any }[] {
    let filteredRecords = this.records;
    if (type) {
      filteredRecords = filteredRecords.filter((r) => r.type === type);
    }

    const results = filteredRecords.map((r) => {
      const score = cosineSimilarity(queryVector, r.embedding);
      return {
        id: r.id,
        type: r.type,
        score: score,
        text: r.text,
        metadata: r.metadata,
      };
    });

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  clear() {
    this.records = [];
    this.save();
  }
}

export const localVectorDb = new LocalVectorDatabase();

// High level Unified Semantic Vector Search
export async function searchVectors(
  queryText: string,
  type?: 'salon' | 'service' | 'product' | 'faq' | 'guide',
  limit = 5
) {
  const queryVector = await getEmbedding(queryText);
  
  // Pinecone Implementation Block
  const pineconeKey = process.env.PINECONE_API_KEY;
  const pineconeIndexName = process.env.PINECONE_INDEX;

  if (pineconeKey && pineconeKey !== 'YOUR_PINECONE_API_KEY_HERE') {
    try {
      console.log('⚡ Pinecone API detected. Querying Pinecone Index...');
      // Dynamic import to prevent import errors if SDK is not installed or fully loaded
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const pc = new Pinecone({ apiKey: pineconeKey });
      const index = pc.Index(pineconeIndexName || 'salonai-index');
      
      const queryResponse = await index.query({
        vector: queryVector,
        topK: limit,
        includeMetadata: true,
        filter: type ? { type: { $eq: type } } : undefined,
      });

      if (queryResponse.matches && queryResponse.matches.length > 0) {
        return queryResponse.matches.map((match) => ({
          id: match.id,
          type: (match.metadata?.type as any) || type,
          score: match.score || 0,
          text: (match.metadata?.text as string) || '',
          metadata: match.metadata || {},
        }));
      }
    } catch (pineconeError) {
      console.error('⚠️ Pinecone query failed, falling back to local vector search:', pineconeError);
    }
  }

  // Fallback to local vector search
  return localVectorDb.search(queryVector, type, limit);
}

// High level Unified Vector Upsert
export async function upsertVector(
  id: string,
  type: 'salon' | 'service' | 'product' | 'faq' | 'guide',
  text: string,
  metadata?: any
) {
  const embedding = await getEmbedding(text);
  
  // 1. Save to local vector db (always do this as local cache/fallback)
  localVectorDb.upsert({ id, type, text, embedding, metadata });

  // 2. Sync to Pinecone if key available
  const pineconeKey = process.env.PINECONE_API_KEY;
  const pineconeIndexName = process.env.PINECONE_INDEX;

  if (pineconeKey && pineconeKey !== 'YOUR_PINECONE_API_KEY_HERE') {
    try {
      const { Pinecone } = await import('@pinecone-database/pinecone');
      const pc = new Pinecone({ apiKey: pineconeKey });
      const index = pc.Index(pineconeIndexName || 'salonai-index');

      await index.upsert([{
        id: `${type}-${id}`,
        values: embedding,
        metadata: {
          id,
          type,
          text,
          ...metadata,
        },
      }]);
      console.log(`Synced ${type}-${id} to Pinecone.`);
    } catch (pineconeError) {
      console.warn('⚠️ Syncing to Pinecone failed, cached locally only:', pineconeError);
    }
  }
}
