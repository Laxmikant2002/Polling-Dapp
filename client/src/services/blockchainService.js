import { ethers } from 'ethers';
import ABI from '../contracts/Abi.json';

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

class BlockchainService {
  constructor(provider) {
    this.provider = provider;
    this.contract = null;
  }

  async initialize() {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      const signer = this.provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      return this.contract;
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      throw error;
    }
  }

  // Voter registration
  async registerVoter(name, age, gender) {
    try {
      const tx = await this.contract.voterRegister(name, age, gender);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error registering voter:', error);
      throw error;
    }
  }

  // Candidate registration
  async registerCandidate(name, party, age, gender) {
    try {
      const tx = await this.contract.candidateRegister(name, party, age, gender);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error registering candidate:', error);
      throw error;
    }
  }

  // Cast vote
  async castVote(voterId, candidateId) {
    try {
      const tx = await this.contract.vote(voterId, candidateId);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  }

  // Get election results
  async getElectionResults() {
    try {
      const results = await this.contract.result();
      return results;
    } catch (error) {
      console.error('Error getting election results:', error);
      throw error;
    }
  }

  // Check if voter has voted
  async hasVoted() {
    try {
      const hasVoted = await this.contract.checkVotedOrNot();
      return hasVoted;
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw error;
    }
  }

  // Check if voter is registered
  async isVoterRegistered() {
    try {
      const isRegistered = await this.contract.checkVoterRegistered();
      return isRegistered;
    } catch (error) {
      console.error('Error checking voter registration:', error);
      throw error;
    }
  }

  // Get voter ID
  async getVoterId() {
    try {
      const voterId = await this.contract.checkVoterID();
      return voterId;
    } catch (error) {
      console.error('Error getting voter ID:', error);
      throw error;
    }
  }

  // Submit feedback
  async submitFeedback(feedback) {
    try {
      const tx = await this.contract.submitFeedback(feedback);
      const receipt = await tx.wait();
      return receipt;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  // Get voting status
  async getVotingStatus() {
    try {
      const status = await this.contract.votingStatus();
      return status;
    } catch (error) {
      console.error('Error getting voting status:', error);
      throw error;
    }
  }

  // Get candidate list
  async getCandidateList() {
    try {
      const candidates = await this.contract.candidateList();
      return candidates;
    } catch (error) {
      console.error('Error getting candidate list:', error);
      throw error;
    }
  }
}

export default BlockchainService; 