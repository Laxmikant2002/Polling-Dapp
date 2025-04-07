import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useContract } from '../context/ContractContext';
import { toast } from 'sonner';

const Elections = () => {
  const navigate = useNavigate();
  const { contract, account } = useContract();
  const [elections, setElections] = useState([]);
  const [filteredElections, setFilteredElections] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setIsLoading(true);
      // Mock elections data
      const mockElections = [
        {
          id: '1',
          title: 'Student Council Election',
          description: 'Vote for your student council representatives',
          status: 'active',
          totalVotes: 150
        },
        {
          id: '2',
          title: 'Class President Election',
          description: 'Choose your class president for the academic year',
          status: 'upcoming',
          totalVotes: 0
        },
        {
          id: '3',
          title: 'Department Head Election',
          description: 'Select the new department head',
          status: 'ended',
          totalVotes: 200
        }
      ];
      
      setElections(mockElections);
      setFilteredElections(mockElections);
    } catch (error) {
      console.error('Mock error fetching elections:', error);
      toast.error('Failed to fetch elections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilter = (e) => {
    const status = e.target.value;
    setStatusFilter(status);
    
    if (status === 'all') {
      setFilteredElections(elections);
    } else {
      const filtered = elections.filter(election => 
        election.status.toLowerCase() === status.toLowerCase()
      );
      setFilteredElections(filtered);
    }
  };

  const handleVote = (electionId) => {
    if (!account) {
      toast.error('Please connect your wallet to vote');
      return;
    }
    navigate(`/voting/${electionId}`);
  };

  const handleViewResults = (electionId) => {
    navigate(`/results/${electionId}`);
  };

  if (isLoading) {
    return (
      <div className="font-['Inter'] bg-gray-50 min-h-screen">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-['Inter'] bg-gray-50 min-h-screen">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Elections</h1>
            <div className="flex space-x-4">
              <select
                className="rounded-lg border-gray-300 text-sm"
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="all">All Elections</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="ended">Ended</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredElections.map((election) => (
              <div key={election.id} className="border rounded-lg p-6 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{election.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{election.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    election.status === 'active' ? 'bg-green-100 text-green-800' :
                    election.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {election.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {election.status === 'ended' ? `Final Votes: ${election.totalVotes}` : `Total Votes: ${election.totalVotes}`}
                  </div>
                  {election.status === 'active' ? (
                    <button
                      onClick={() => handleVote(election.id)}
                      className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
                    >
                      Vote Now
                    </button>
                  ) : election.status === 'upcoming' ? (
                    <button
                      className="bg-gray-100 text-gray-500 px-4 py-2 rounded-button text-sm font-medium"
                      disabled
                    >
                      Coming Soon
                    </button>
                  ) : (
                    <button
                      onClick={() => handleViewResults(election.id)}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-200"
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Elections;