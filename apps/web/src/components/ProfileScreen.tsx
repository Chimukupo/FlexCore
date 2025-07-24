import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ProfileScreen = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            uid: data.uid,
            email: data.email,
            displayName: data.displayName,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          // Fallback to Firebase Auth user data if Firestore profile doesn't exist
          setProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'No name provided',
            createdAt: new Date(user.metadata.creationTime || Date.now()),
            updatedAt: new Date(),
          });
        }
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Logout error:', error);
      setError('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {profile?.displayName || 'User'}!
            </h1>
            <p className="text-gray-600">FlexCore Fitness App</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Profile Information</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{profile?.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Display Name</label>
                  <p className="text-sm text-gray-900">{profile?.displayName || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-sm text-gray-900">
                    {profile?.createdAt?.toLocaleDateString() || 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Account Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">0</p>
                  <p className="text-sm text-gray-600">Workouts</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-indigo-600">0</p>
                  <p className="text-sm text-gray-600">Routines</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => alert('Feature coming soon!')}
            >
              Edit Profile
            </Button>
            
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 