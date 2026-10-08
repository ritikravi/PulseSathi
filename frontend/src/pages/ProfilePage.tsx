import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="card text-center py-12">
      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Settings</h2>
      <p className="text-gray-600">Manage your profile and preferences</p>
      <p className="text-sm text-gray-500 mt-4">Coming soon...</p>
    </div>
  );
}
