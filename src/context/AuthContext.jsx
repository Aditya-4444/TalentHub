import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider,
  seedJobsIfEmpty,
  isFirebaseConfigured
} from '../services/firebase';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Monitor auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      setProfileLoaded(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Seed database if it's empty (only runs for authenticated users)
        seedJobsIfEmpty();

        // Subscribe to real-time user document changes in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        
        // Set loading to false immediately because Auth state is resolved.
        // The App component will handle loading userData separately.
        setLoading(false);

        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          } else {
            setUserData(null);
          }
          setProfileLoaded(true);
        }, (error) => {
          console.error("Error listening to user document:", error);
          setUserData(null);
          setProfileLoaded(true);
        });

        return () => unsubDoc();
      } else {
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
        setProfileLoaded(true);
      }
    });

    return unsubscribe;
  }, []);

  // Email/Password Signup
  async function signup(email, password, displayName, role) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Auth Profile Display Name
    await updateProfile(user, { displayName });

    // Create User Document in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const newUserData = {
      uid: user.uid,
      displayName,
      email,
      role, // 'provider' or 'seeker'
      photoURL: '',
      headline: '',
      location: '',
      bio: '',
      plan: 'free', // Both start with free plan
      createdAt: serverTimestamp()
    };
    await setDoc(userDocRef, newUserData);
    return userCredential;
  }

  // Email/Password Login
  async function login(email, password, selectedRole) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check role in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    
    if (userSnap.exists()) {
      const dbRole = userSnap.data().role;
      if (dbRole !== selectedRole) {
        const msg = "Selected role does not match this account. Please verify your role selection.";
        localStorage.setItem('auth_error_flash', msg);
        // Sign out immediately so auth state doesn't login the user
        await signOut(auth);
        const error = new Error(msg);
        error.code = 'auth/role-mismatch';
        throw error;
      }
    }
    return userCredential;
  }

  // Google Sign-In
  async function loginWithGoogle(selectedRole) {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if the user document already exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);

    if (userSnap.exists()) {
      const dbRole = userSnap.data().role;
      if (dbRole !== selectedRole) {
        const msg = "Selected role does not match this account. Please verify your role selection.";
        localStorage.setItem('auth_error_flash', msg);
        // Sign out immediately so auth state doesn't login the user
        await signOut(auth);
        const error = new Error(msg);
        error.code = 'auth/role-mismatch';
        throw error;
      }
    } else {
      // Create a user document with the role passed from Screen 1
      const newUserData = {
        uid: user.uid,
        displayName: user.displayName || 'Anonymous User',
        email: user.email,
        role: selectedRole, // 'provider' or 'seeker'
        photoURL: user.photoURL || '',
        headline: '',
        location: '',
        bio: '',
        plan: 'free',
        createdAt: serverTimestamp()
      };
      await setDoc(userDocRef, newUserData);
    }
    return result;
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Reset Password
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // Update Profile Data
  async function updateProfileData(profileData) {
    if (!currentUser) throw new Error("No user is logged in");
    
    // Update Firebase Auth Profile
    await updateProfile(currentUser, { displayName: profileData.displayName });

    // Update Firestore user document
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, profileData);
  }

  // Upgrade Plan to Silver/Gold/Free
  async function upgradeToPlan(planName) {
    if (!currentUser || !userData) throw new Error("No authenticated user");
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      plan: planName
    });
  }

  // Create User Profile Document manually
  async function createProfileDocument(role) {
    if (!currentUser) throw new Error("No authenticated user");
    const userDocRef = doc(db, 'users', currentUser.uid);
    const newUserData = {
      uid: currentUser.uid,
      displayName: currentUser.displayName || 'Anonymous User',
      email: currentUser.email,
      role, // 'provider' or 'seeker'
      photoURL: currentUser.photoURL || '',
      headline: '',
      location: '',
      bio: '',
      plan: 'free',
      createdAt: serverTimestamp()
    };
    await setDoc(userDocRef, newUserData);
  }

  const value = {
    currentUser,
    userData,
    loading,
    profileLoaded,
    createProfileDocument,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfileData,
    upgradeToPlan
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
