import React, { useState } from 'react';
import { useContract } from '../context/ContractContext';
import { toast } from 'sonner';

const UserVerification = () => {
  const { isAdmin, verifyUser } = useContract();
  const [userId, setUserId] = useState('');
  const [userType, setUserType] = useState('voter');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only admin can verify users');
      return;
    }

    try {
      setIsVerifying(true);
      await verifyUser(parseInt(userId), userType);
      toast.success('User verified successfully!');
      setUserId('');
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify user');
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">User Verification</h2>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>
          <input
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
            placeholder="Enter user ID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            User Type
          </label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
          >
            <option value="voter">Voter</option>
            <option value="candidate">Candidate</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className={`w-full !rounded-button ${
            isVerifying ? 'bg-gray-400' : 'bg-custom hover:bg-custom/90'
          } text-white px-4 py-2 text-sm font-medium`}
        >
          {isVerifying ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Verifying...
            </>
          ) : (
            <>
              <i className="fas fa-check-circle mr-2"></i>
              Verify User
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UserVerification; 