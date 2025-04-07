const { ethers } = require('ethers');
const { logTransaction } = require('./auditService');

class BatchService {
  constructor(contract, provider) {
    this.contract = contract;
    this.provider = provider;
    this.batchSize = 50; // Maximum number of votes per batch
    this.pendingVotes = [];
    this.processing = false;
  }

  async addVote(voteData) {
    this.pendingVotes.push(voteData);
    
    if (this.pendingVotes.length >= this.batchSize && !this.processing) {
      await this.processBatch();
    }
  }

  async processBatch() {
    if (this.processing || this.pendingVotes.length === 0) return;
    
    this.processing = true;
    const batch = this.pendingVotes.splice(0, this.batchSize);

    try {
      // Create batch transaction
      const tx = await this.contract.batchVote(
        batch.map(v => v.electionId),
        batch.map(v => v.candidateId),
        batch.map(v => v.voterId)
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      // Log batch transaction
      await logTransaction({
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        from: receipt.from,
        to: receipt.to,
        action: 'batch_vote',
        metadata: {
          votes: batch.length,
          electionIds: batch.map(v => v.electionId),
          candidateIds: batch.map(v => v.candidateId)
        }
      });

      this.logger.info(`Processed batch of ${batch.length} votes`, {
        transactionHash: receipt.transactionHash
      });
    } catch (error) {
      this.logger.error('Error processing batch:', error);
      // Return failed votes to pending queue
      this.pendingVotes.unshift(...batch);
    } finally {
      this.processing = false;
      
      // Process next batch if available
      if (this.pendingVotes.length > 0) {
        setTimeout(() => this.processBatch(), 1000);
      }
    }
  }

  getPendingVotes() {
    return this.pendingVotes.length;
  }

  async forceProcess() {
    if (this.pendingVotes.length > 0) {
      await this.processBatch();
    }
  }
}

module.exports = BatchService; 