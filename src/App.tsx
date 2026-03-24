import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import LibraryPage from './pages/LibraryPage'
import SermonViewPage from './pages/SermonViewPage'
import GeneratorPage from './pages/GeneratorPage'
import Navbar from './components/Navbar'
import { useState,useEffect } from 'react'
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from "./firebase";
import type { UserProfile } from './types'
import './App.css'



export type View = 'landing' | 'dashboard' | 'generator' | 'library' | 'view-sermon'


function App() {
 
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedSermonId, setSelectedSermonId] = useState<string | null>(null);
  const [loading , setLoading]=useState(true)
  
  



    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const userRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            
            if (!userDoc.exists()) {
              const newProfile: UserProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName,
                sermonCount: 0,
                createdAt: new Date().toISOString(),
              };
              await setDoc(userRef, newProfile);
              setProfile(newProfile);
            } else {
              const data = userDoc.data() as UserProfile;
              setProfile({
                ...data,
                sermonCount: data.sermonCount || 0
              });
            }
          } catch (err) {
            console.error("Error checking user profile:", err);
          }
          if (view === "landing") setView("dashboard");
        } else {
          setView("landing");
          setProfile(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }, []);
  
  
  
    const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setView("dashboard");
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Login Error: " + (error.message || "Please check if Google Sign-in is enabled in your Firebase Console."));
    }
  };

  const handleLogout = async () => {
    await signOut(auth)
    setView('landing')
  }

  const navigateToSermon = (id: string) => {
     setSelectedSermonId(id);
     setView("view-sermon");
   };

  
  
  if (loading)
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        Loading...
      </div>
    );


  return (
    <div className="min-h-screen bg-[#F5F5F0] text-stone-900 font-sans">
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        setView={setView}
        currentView={view}
      />
      <main className="pt-20">
        {view === 'landing' && <LandingPage onGetStarted={handleLogin} />}
        {view === 'dashboard' && <Dashboard onNavigate={setView} onSermonClick={navigateToSermon} />}
        {view === 'generator' && (
          <GeneratorPage 
            userProfile={profile} 
            onSermonGenerated={navigateToSermon} 
            onProfileUpdate={(updated) => setProfile(updated)}
          />
        )}
        {view === 'library' && <LibraryPage onSermonClick={navigateToSermon} />}
        {view === 'view-sermon' && selectedSermonId && (
          <SermonViewPage 
            sermonId={selectedSermonId} 
            userProfile={profile}
            onBack={() => setView('library')} 
          />
        )}
      </main>
    </div>
  );
}

export default App
