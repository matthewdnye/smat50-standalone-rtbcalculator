import axios from 'axios';
import { WebhookPayload } from '../types/submission';

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/jozRUqQWa9zk8ExtFbmV/webhook-trigger/7e796d50-37cb-4de3-a71d-5060fb1aceee';
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const submitToWebhook = async (payload: WebhookPayload): Promise<void> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await axios.post(WEBHOOK_URL, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Webhook submission successful:', response.status);
      return; // Success, exit function
    } catch (error) {
      console.error(`Webhook attempt ${attempt} failed:`, error);
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }

  // If we get here, all retries failed
  throw new Error(`Webhook submission failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
};