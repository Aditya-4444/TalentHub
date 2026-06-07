import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  doc, 
  query, 
  limit, 
  serverTimestamp,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  where,
  getDoc
} from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
export const isFirebaseConfigured = !!apiKey && apiKey !== 'your_api_key' && apiKey !== '';

let appInstance = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const auth = authInstance;
export const db = dbInstance;
export const googleProvider = googleProviderInstance;

// Seeding function (check if jobs collection is empty, then seed 6 jobs)
export async function seedJobsIfEmpty() {
  try {
    const jobsRef = collection(db, 'jobs');
    const q = query(jobsRef, limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log("Seeding sample jobs...");
      const sampleJobs = [
        {
          title: "Senior React Engineer",
          company: "TechVibe",
          location: "San Francisco, CA",
          type: "Full-time",
          department: "Engineering",
          salary: "$130,000 - $160,000",
          description: "We are looking for a Senior React Engineer to join our core product team. You will lead the development of our web applications, optimize rendering performance, and mentor junior developers. Experience with state management libraries and performance optimization tools is highly desired.",
          postedAt: serverTimestamp(),
          providerId: "system-seed"
        },
        {
          title: "Product Designer",
          company: "CreativeFlow",
          location: "Remote (US)",
          type: "Remote",
          department: "Design",
          salary: "$110,000 - $140,000",
          description: "Join our remote-first team as a Product Designer. You will be responsible for creating beautiful, intuitive interfaces, conducting user research, and collaborating closely with engineering. Strong portfolio showcasing end-to-end design process is required.",
          postedAt: serverTimestamp(),
          providerId: "system-seed"
        },
        {
          title: "Product Manager (Growth)",
          company: "ScaleUp",
          location: "New York, NY",
          type: "Full-time",
          department: "Product",
          salary: "$120,000 - $150,000",
          description: "ScaleUp is looking for a Growth Product Manager to own our acquisition and conversion funnels. You will run experiments, analyze user behavior, and drive key product metrics. High proficiency in data analytics and A/B testing frameworks is expected.",
          postedAt: serverTimestamp(),
          providerId: "system-seed"
        },
        {
          title: "Marketing Specialist",
          company: "BrandSpark",
          location: "Austin, TX",
          type: "Part-time",
          department: "Marketing",
          salary: "$40 - $60 / hour",
          description: "We are seeking a Part-time Marketing Specialist to manage our social media campaigns, run email newsletters, and assist with content creation. You will work closely with the design team to maintain brand consistency across all channels.",
          postedAt: serverTimestamp(),
          providerId: "system-seed"
        },
        {
          title: "Frontend Developer (Contract)",
          company: "DevSquad",
          location: "Remote",
          type: "Contract",
          department: "Engineering",
          salary: "$80 - $100 / hour",
          description: "6-month contract for a Frontend Developer with strong React and Tailwind CSS skills. You will build new features for a high-traffic SaaS dashboard. This role requires excellent communication skills and familiarity with Git workflows.",
          postedAt: serverTimestamp(),
          providerId: "system-seed"
        },
        {
          title: "UX Researcher",
          company: "PixelPerfect",
          location: "Los Angeles, CA",
          type: "Contract",
          department: "Design",
          salary: "$70 - $90 / hour",
          description: "Looking for a contract UX Researcher to conduct usability testing, create user personas, and provide actionable design recommendations. You will collaborate with design and product teams to translate research findings into product improvements.",
          postedAt: serverTimestamp(),
          providerId: "system-seed"
        }
      ];
      
      for (const job of sampleJobs) {
        await addDoc(jobsRef, job);
      }
      console.log("Seeding complete. 6 jobs added.");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error seeding jobs:", error);
    return false;
  }
}
