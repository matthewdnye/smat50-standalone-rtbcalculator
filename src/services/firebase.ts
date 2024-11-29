import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, updateDoc, doc, serverTimestamp, enableIndexedDbPersistence } from 'firebase/firestore';
import { CalculationResult } from '../types/calculator';
import { submitToWebhook } from './webhook';
import { createSubmissionPayload } from '../utils/submissionPayload';

const firebaseConfig = {
  apiKey: "AIzaSyDOIwxEhtr6diZaQMBqAgRVNj6wDmnvFjM",
  authDomain: "smat50-rtb-calculator.firebaseapp.com",
  projectId: "smat50-rtb-calculator",
  storageBucket: "smat50-rtb-calculator.firebasestorage.app",
  messagingSenderId: "283394656516",
  appId: "1:283394656516:web:91010a50ce7cac736da851",
  measurementId: "G-X6FFD1201Y"
};

// Initialize Firebase with error handling
let app;
let db;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  analytics = getAnalytics(app);
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
    console.warn('Firebase persistence error:', err);
  });
} catch (error) {
  console.error('Firebase initialization error:', error);
}

const updateWebhookStatus = async (docId: string, status: {
  status: 'success' | 'failed';
  attempts: number;
  lastAttempt: string;
  error: string | null;
}) => {
  if (!db) return;
  
  try {
    const docRef = doc(db, 'calculator-submissions', docId);
    await updateDoc(docRef, { webhook: status });
  } catch (error) {
    console.warn('Error updating webhook status:', error);
  }
};

export const storeCalculatorData = async (result: CalculationResult): Promise<void> => {
  // If Firebase isn't initialized, just proceed with webhook
  if (!db) {
    try {
      const submissionPayload = createSubmissionPayload(result);
      await submitToWebhook(submissionPayload);
      return;
    } catch (error) {
      console.error('Webhook submission failed:', error);
      return;
    }
  }

  try {
    const submissionPayload = createSubmissionPayload(result);
    
    // Prepare Firebase document
    const firebaseDoc = {
      ...submissionPayload,
      id: crypto.randomUUID(),
      createdAt: serverTimestamp(),
      webhook: {
        status: 'pending',
        attempts: 0,
        lastAttempt: null,
        error: null
      }
    };

    // Store in Firebase
    const docRef = await addDoc(collection(db, 'calculator-submissions'), firebaseDoc);

    // Submit to webhook with retry logic
    try {
      await submitToWebhook(submissionPayload);
      
      await updateWebhookStatus(docRef.id, {
        status: 'success',
        attempts: 1,
        lastAttempt: new Date().toISOString(),
        error: null
      });
    } catch (webhookError: any) {
      console.warn('Webhook submission failed:', webhookError);
      
      await updateWebhookStatus(docRef.id, {
        status: 'failed',
        attempts: 3,
        lastAttempt: new Date().toISOString(),
        error: webhookError?.message || 'Unknown error'
      });
    }
  } catch (error) {
    // If Firebase fails, still try to submit to webhook
    try {
      const submissionPayload = createSubmissionPayload(result);
      await submitToWebhook(submissionPayload);
    } catch (webhookError) {
      console.error('Both Firebase and webhook submission failed:', webhookError);
    }
  }
};