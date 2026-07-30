import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with custom databaseId if configured
export const db = firebaseConfigData.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Firebase Cloud Storage
export const storage = getStorage(app);

export const ADMIN_EMAIL = 'santilatanyak@gmail.com';

/**
 * Perform Google Sign-In with Firebase Auth.
 * Strictly checks if the authenticated user's email matches santilatanyak@gmail.com.
 */
export const signInWithGoogleAdmin = async () => {
  try {
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (!user.email || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      await firebaseSignOut(auth);
      throw new Error(`Access Denied: Only ${ADMIN_EMAIL} is authorized to access the Admin Panel.`);
    }

    return user;
  } catch (error: any) {
    console.error('Firebase Admin Sign-In Error:', error);
    throw error;
  }
};

/**
 * Sign out from Firebase
 */
export const logoutFromFirebase = async () => {
  await firebaseSignOut(auth);
};

/**
 * Upload an image file directly to Firebase Cloud Storage.
 * Returns the public download URL of the uploaded image.
 */
export const uploadPhotoToFirebaseStorage = async (file: File, folderName: string = 'admin_uploads'): Promise<string> => {
  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const imageRef = storageRef(storage, `${folderName}/${timestamp}_${cleanFileName}`);
    
    // Upload bytes
    const snapshot = await uploadBytes(imageRef, file);
    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Firebase Storage Upload Warning, fallback to base64 DataURL:', error);
    // Fallback to FileReader base64 if storage bucket CORS or network issue
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
};
