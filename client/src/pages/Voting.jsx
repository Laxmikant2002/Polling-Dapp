import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useContract } from '../context/ContractContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import BlockchainService from '../services/blockchainService';

const Voting = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, provider } = useContract();
  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [voteAttempts, setVoteAttempts] = useState(0);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [voteCounts, setVoteCounts] = useState({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [voteReceipt, setVoteReceipt] = useState(null);
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    isAnonymous: false
  });
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [blockchainService, setBlockchainService] = useState(null);

  useEffect(() => {
    if (provider) {
      const service = new BlockchainService(provider);
      service.initialize().then(() => {
        setBlockchainService(service);
      });
    }
  }, [provider]);

  useEffect(() => {
    if (blockchainService) {
      fetchElectionData();
    }
  }, [blockchainService]);

  const fetchElectionData = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is registered
      const isRegistered = await blockchainService.isVoterRegistered();
      if (!isRegistered) {
        setErrorMessage('You are not registered to vote in this election');
        setShowErrorModal(true);
        return;
      }

      // Check if user has already voted
      const hasVoted = await blockchainService.hasVoted();
      if (hasVoted) {
        setErrorMessage('You have already voted in this election');
        setShowErrorModal(true);
        return;
      }

      // Get candidate list
      const candidates = await blockchainService.getCandidateList();
      
      // Get voting status
      const status = await blockchainService.getVotingStatus();
      
      setElection({
        id,
        title: 'Election 2024',
        status,
        candidates: candidates.map(candidate => ({
          id: candidate.candidateId.toString(),
          name: candidate.name,
          party: candidate.party,
          description: `Age: ${candidate.age}, Gender: ${candidate.gender}`
        }))
      });
    } catch (error) {
      console.error('Error fetching election data:', error);
      setErrorMessage('Failed to load election data');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      setErrorMessage('Please select a candidate');
      setShowErrorModal(true);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get voter ID
      const voterId = await blockchainService.getVoterId();
      
      // Cast vote
      const receipt = await blockchainService.castVote(voterId, selectedCandidate);
      
      setVoteReceipt({
        transactionId: receipt.transactionHash,
        timestamp: new Date().toISOString()
      });
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error casting vote:', error);
      setErrorMessage('Failed to cast vote');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityVerification = async () => {
    if (securityCode !== '1234') {
      setVoteAttempts(prev => prev + 1);
      setErrorMessage('Invalid security code. Please try again.');
      setShowErrorModal(true);
      setShowSecurityModal(false);
      return;
    }
    setShowSecurityModal(false);
    setShowConfirmationModal(true);
  };

  const confirmVote = async () => {
    try {
      setShowConfirmationModal(false);
      setIsLoading(true);
      
      // Simulate voting delay and transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockTxId = '0x' + Math.random().toString(16).substr(2, 64);
      setVoteReceipt({ transactionId: mockTxId });
      
      setTotalVotes(prev => prev + 1);
      setVoteCounts(prev => ({ ...prev, [selectedCandidate]: (prev[selectedCandidate] || 0) + 1 }));
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Mock error submitting vote:', error);
      setErrorMessage('Failed to submit vote. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResults = () => {
    navigate('/results/' + id);
  };

  const fetchVoteCounts = async () => {
    try {
      // Mock vote counts
      const mockVoteCounts = {
        1: 150,
        2: 120,
        3: 80
      };
      setVoteCounts(mockVoteCounts);
      setTotalVotes(Object.values(mockVoteCounts).reduce((a, b) => a + b, 0));
    } catch (error) {
      console.error('Error fetching vote counts:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchVoteCounts, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleViewCandidateDetails = (candidate) => {
    setCandidateDetails(candidate);
    setShowCandidateModal(true);
  };

  const generateVoteReceipt = () => {
    const receipt = {
      electionId: id,
      electionTitle: election.title,
      candidateName: election.candidates.find(c => c.id === selectedCandidate)?.name,
      candidateId: selectedCandidate,
      timestamp: new Date().toISOString(),
      transactionId: voteReceipt?.transactionId,
      voterId: account,
      verificationHash: '0x' + Math.random().toString(16).substr(2, 64)
    };
    return receipt;
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);

    try {
      const feedbackText = `Rating: ${feedback.rating}/5\nComment: ${feedback.comment}\nAnonymous: ${feedback.isAnonymous}`;
      await blockchainService.submitFeedback(feedbackText);
      toast.success('Thank you for your feedback!');
      setShowSuccessModal(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
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

  if (!election) {
    return (
      <div className="font-['Inter'] bg-gray-50 min-h-screen">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">Election not found</div>
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
          <div className="max-w-3xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-lg shadow-sm p-6 border"
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      selectedCandidate ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedCandidate ? 'Selected' : 'Not Selected'}
                    </span>
                    <div className="text-sm text-gray-500">
                      <i className="far fa-clock mr-2"></i>
                      {election.maxVoteAttempts - voteAttempts} attempts remaining
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{election.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <i className="fas fa-shield-alt mr-2"></i>
                  Security Level: {election.securityLevel}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold mb-4">Select Your Candidate</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {election.candidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      whileHover={{ scale: 1.02 }}
                      className={`border rounded-lg p-4 hover:border-custom cursor-pointer transition-colors ${
                        selectedCandidate === candidate.id ? 'border-custom bg-custom/5' : ''
                      }`}
                      onClick={() => setSelectedCandidate(candidate.id)}
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{candidate.name}</h3>
                          <p className="text-sm text-gray-500">{candidate.description}</p>
                          <div className="mt-2 space-y-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewCandidateDetails(candidate);
                              }}
                              className="text-sm text-custom hover:text-custom/80"
                            >
                              View Details
                            </button>
                            <div className="text-sm text-gray-500">
                              Votes: {voteCounts[candidate.id] || 0} ({totalVotes > 0 ? ((voteCounts[candidate.id] || 0) / totalVotes * 100).toFixed(1) : 0}%)
                            </div>
                          </div>
                        </div>
                        {selectedCandidate === candidate.id && (
                          <div className="ml-auto text-custom">
                            <i className="fas fa-check-circle text-xl"></i>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Your vote will be recorded on the blockchain and cannot be changed.
                  </p>
                  <button
                    onClick={handleVote}
                    disabled={selectedCandidate === null}
                    className={`bg-custom text-white px-6 py-2 rounded-button text-sm font-medium ${
                      selectedCandidate === null ? 'opacity-50 cursor-not-allowed' : 'hover:bg-custom/90'
                    }`}
                  >
                    {selectedCandidate ? 'Submit Vote' : 'Select Candidate'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Enhanced Security Modal */}
      {showSecurityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Security Verification</h2>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                Please enter the security code sent to your registered email.
              </p>
              <input
                type="text"
                value={securityCode}
                onChange={(e) => setSecurityCode(e.target.value)}
                placeholder="Enter security code"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowSecurityModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSecurityVerification}
                className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Confirm Your Vote</h2>
            <p className="text-gray-600 mb-6">
              You are about to vote for {election.candidates.find(c => c.id === selectedCandidate)?.name}. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
              >
                Confirm Vote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {showCandidateModal && candidateDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={candidateDetails.photo}
                  alt={candidateDetails.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h2 className="text-2xl font-bold">{candidateDetails.name}</h2>
                  <p className="text-gray-600">{candidateDetails.description}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCandidateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Manifesto</h3>
                <p className="text-gray-600">{candidateDetails.manifesto}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Achievements</h3>
                <ul className="list-disc list-inside text-gray-600">
                  {candidateDetails.achievements.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Vote Statistics</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total Votes</span>
                    <span className="font-medium">{voteCounts[candidateDetails.id] || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Vote Percentage</span>
                    <span className="font-medium">
                      {totalVotes > 0 ? ((voteCounts[candidateDetails.id] || 0) / totalVotes * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal with Receipt and Feedback */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>
              <h2 className="text-2xl font-bold mb-2">Vote Submitted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                Your vote has been recorded on the blockchain.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Vote Receipt</h3>
                <div className="text-left space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Election:</span> {election.title}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Candidate:</span> {election.candidates.find(c => c.id === selectedCandidate)?.name}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono block break-all">{voteReceipt?.transactionId}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Timestamp:</span> {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              {!showFeedbackForm ? (
                <div className="space-y-4">
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleViewResults}
                      className="bg-custom text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-custom/90"
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => {
                        const receipt = generateVoteReceipt();
                        const receiptBlob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
                        const receiptUrl = URL.createObjectURL(receiptBlob);
                        const link = document.createElement('a');
                        link.href = receiptUrl;
                        link.download = `vote-receipt-${voteReceipt?.transactionId}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(receiptUrl);
                      }}
                      className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
                    >
                      Download Receipt
                    </button>
                  </div>
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="text-custom hover:text-custom/80 text-sm font-medium"
                  >
                    <i className="fas fa-comment-alt mr-2"></i>
                    Provide Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How was your voting experience?
                    </label>
                    <div className="flex justify-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                          className={`text-2xl ${feedback.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      id="comment"
                      value={feedback.comment}
                      onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom focus:ring-custom"
                      rows={3}
                      placeholder="Share your thoughts about the voting process..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={feedback.isAnonymous}
                      onChange={(e) => setFeedback(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="h-4 w-4 text-custom focus:ring-custom border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                      Submit anonymously
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-button text-sm font-medium hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingFeedback || feedback.rating === 0}
                      className={`bg-custom text-white px-4 py-2 rounded-button text-sm font-medium ${
                        isSubmittingFeedback || feedback.rating === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-custom/90'
                      }`}
                    >
                      {isSubmittingFeedback ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Submitting...
                        </>
                      ) : (
                        'Submit Feedback'
                      )}
                    </button>
                  </div>
                </form>
              )}
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
              <h2 className="text-2xl font-bold mb-2">Vote Submission Failed</h2>
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

export default Voting;