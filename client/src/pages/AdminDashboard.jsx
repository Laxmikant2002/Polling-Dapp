import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useContract } from '../context/ContractContext';
import { toast } from 'sonner';
import VoterListManager from '../components/VoterListManager';
import { checkAdminStatus } from '../services/adminService';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions
} from '@mui/material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { contract, account, isAdmin } = useContract();
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    totalVoters: 0,
    votesCast: 0,
    turnout: '0%'
  });
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    candidates: [{ name: '', description: '' }]
  });
  const [activeTab, setActiveTab] = useState('elections');

  useEffect(() => {
    const checkAccess = async () => {
      if (!account) {
        toast.error('Please connect your wallet');
        navigate('/');
        return;
      }

      // Check admin status
      const isAdminUser = await checkAdminStatus(localStorage.getItem('userEmail'));
      if (!isAdminUser) {
        toast.error('Access denied. Admin privileges required');
        navigate('/elections');
        return;
      }

      fetchElections();
      updateStats();
    };

    checkAccess();
  }, [contract, account, navigate]);

  const updateStats = async () => {
    try {
      // Mock stats update
      setStats({
        totalVoters: 500,
        votesCast: 300,
        turnout: '60%'
      });
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  const fetchElections = async () => {
    try {
      setIsLoading(true);
      // Mock elections data
      const mockElections = [
        {
          id: '1',
          title: 'Student Council Election',
          description: 'Vote for your student council representatives',
          startDate: '2024-03-01',
          endDate: '2024-03-15',
          status: 'active',
          totalVotes: 150
        },
        {
          id: '2',
          title: 'Class President Election',
          description: 'Choose your class president for the academic year',
          startDate: '2024-04-01',
          endDate: '2024-04-15',
          status: 'upcoming',
          totalVotes: 0
        }
      ];
      
      setElections(mockElections);
    } catch (error) {
      console.error('Mock error fetching elections:', error);
      toast.error('Failed to fetch elections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    try {
      // Simulate creating election
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage('Election created successfully!');
      setShowSuccessModal(true);
      setShowCreateModal(false);
      setNewElection({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        candidates: [{ name: '', description: '' }]
      });
      fetchElections();
    } catch (error) {
      console.error('Mock error creating election:', error);
      setErrorMessage('Failed to create election');
      setShowErrorModal(true);
    }
  };

  const handleEndElection = async (electionId) => {
    setCurrentAction({ type: 'end', electionId });
    setShowActionModal(true);
  };

  const handleDeleteElection = async (electionId) => {
    setCurrentAction({ type: 'delete', electionId });
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    try {
      setShowActionModal(false);
      setIsLoading(true);
      
      if (currentAction.type === 'end') {
        // Simulate ending election
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSuccessMessage('Election ended successfully!');
        setShowSuccessModal(true);
      } else if (currentAction.type === 'delete') {
        // Simulate deleting election
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSuccessMessage('Election deleted successfully!');
        setShowSuccessModal(true);
      }
      
      fetchElections();
    } catch (error) {
      console.error('Mock error performing action:', error);
      setErrorMessage('Failed to perform action');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const addCandidate = () => {
    setNewElection({
      ...newElection,
      candidates: [...newElection.candidates, { name: '', description: '' }]
    });
  };

  const removeCandidate = (index) => {
    const updatedCandidates = newElection.candidates.filter((_, i) => i !== index);
    setNewElection({
      ...newElection,
      candidates: updatedCandidates
    });
  };

  const updateCandidate = (index, field, value) => {
    const updatedCandidates = [...newElection.candidates];
    updatedCandidates[index] = {
      ...updatedCandidates[index],
      [field]: value
    };
    setNewElection({
      ...newElection,
      candidates: updatedCandidates
    });
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1">
            You do not have permission to access this page.
          </Typography>
        </Box>
      </Container>
    );
  }

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
          <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Admin Dashboard
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Election Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Create and manage elections, view results, and verify votes.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button component={Link} to="/elections" color="primary">
                        Manage Elections
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        User Verification
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Verify voters and candidates for elections.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button component={Link} to="/verify" color="primary">
                        Verify Users
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Monitoring Dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View system activities and transaction logs.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button component={Link} to="/monitoring" color="primary">
                        View Monitoring
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Results Management
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View and manage election results.
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button component={Link} to="/results" color="primary">
                        View Results
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Container>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('elections')}
                className={`${
                  activeTab === 'elections'
                    ? 'border-custom text-custom'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Elections
              </button>
              <button
                onClick={() => setActiveTab('voterList')}
                className={`${
                  activeTab === 'voterList'
                    ? 'border-custom text-custom'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Voter List
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'elections' ? (
            // Admin Greeting and Control Panel
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-gray-500 mt-1">Welcome, {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
                >
                  Create New Election
                </button>
              </div>

              {/* Monitoring Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Total Voters</h3>
                  <p className="text-3xl font-bold text-custom">{stats.totalVoters}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Votes Cast</h3>
                  <p className="text-3xl font-bold text-custom">{stats.votesCast}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900">Turnout</h3>
                  <p className="text-3xl font-bold text-custom">{stats.turnout}</p>
                </div>
              </div>
            </div>
          ) : (
            <VoterListManager />
          )}

          {/* Elections Grid */}
          {activeTab === 'elections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {elections.map((election) => (
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
                  <div className="text-sm text-gray-500 mb-4">
                    <p>Start Date: {election.startDate}</p>
                    <p>End Date: {election.endDate}</p>
                    <p>Total Votes: {election.totalVotes}</p>
                  </div>
                  <div className="flex space-x-2">
                    {election.status === 'active' && (
                      <button
                        onClick={() => handleEndElection(election.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-red-600"
                      >
                        End Election
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteElection(election.id)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold mb-6">Create New Election</h2>
            <form onSubmit={handleCreateElection}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newElection.title}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={newElection.description}
                    onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newElection.startDate}
                      onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newElection.endDate}
                      onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidates
                  </label>
                  {newElection.candidates.map((candidate, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="Candidate Name"
                        value={candidate.name}
                        onChange={(e) => updateCandidate(index, 'name', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={candidate.description}
                        onChange={(e) => updateCandidate(index, 'description', e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeCandidate(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCandidate}
                    className="mt-2 text-custom hover:text-custom/80"
                  >
                    <i className="fas fa-plus mr-1"></i> Add Candidate
                  </button>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
                >
                  Create Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Confirm Action</h2>
            <p className="text-gray-600 mb-6">
              {currentAction?.type === 'end' 
                ? 'Are you sure you want to end this election? This action cannot be undone.'
                : 'Are you sure you want to delete this election? This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowActionModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Success!</h2>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <i className="fas fa-exclamation text-red-600 text-xl"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;