const { ethers } = require('ethers');
const { logTransaction } = require('./auditService');

class MultiSigService {
  constructor(contractAddress, abi, provider) {
    this.contract = new ethers.Contract(contractAddress, abi, provider);
    this.pendingTransactions = new Map();
  }

  async createTransaction(action, data) {
    const txId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${action}-${Date.now()}`)
    );

    this.pendingTransactions.set(txId, {
      action,
      data,
      signatures: new Set(),
      createdAt: Date.now()
    });

    return txId;
  }

  async addSignature(txId, signer, signature) {
    const tx = this.pendingTransactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    // Verify signature
    const messageHash = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(txId)
    );
    const recoveredAddress = ethers.utils.verifyMessage(
      messageHash,
      signature
    );

    if (recoveredAddress.toLowerCase() !== signer.toLowerCase()) {
      throw new Error('Invalid signature');
    }

    tx.signatures.add(signer.toLowerCase());

    // Check if we have enough signatures
    if (tx.signatures.size >= this.requiredSignatures) {
      await this.executeTransaction(txId);
    }

    return tx.signatures.size;
  }

  async executeTransaction(txId) {
    const tx = this.pendingTransactions.get(txId);
    if (!tx) {
      throw new Error('Transaction not found');
    }

    try {
      let result;
      switch (tx.action) {
        case 'end_election':
          result = await this.contract.endElection(tx.data.electionId);
          break;
        case 'add_candidate':
          result = await this.contract.addCandidate(
            tx.data.name,
            tx.data.party,
            tx.data.age,
            tx.data.gender
          );
          break;
        case 'emergency_pause':
          result = await this.contract.pause();
          break;
        default:
          throw new Error('Invalid action');
      }

      // Log the transaction
      await logTransaction({
        hash: result.hash,
        blockNumber: result.blockNumber,
        from: result.from,
        to: result.to,
        action: tx.action,
        metadata: tx.data
      });

      // Clear the transaction
      this.pendingTransactions.delete(txId);

      return result;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw error;
    }
  }

  getPendingTransactions() {
    return Array.from(this.pendingTransactions.entries()).map(([txId, tx]) => ({
      txId,
      action: tx.action,
      data: tx.data,
      signatures: Array.from(tx.signatures),
      createdAt: tx.createdAt
    }));
  }

  getTransactionStatus(txId) {
    const tx = this.pendingTransactions.get(txId);
    if (!tx) {
      return null;
    }

    return {
      action: tx.action,
      data: tx.data,
      signatures: Array.from(tx.signatures),
      createdAt: tx.createdAt,
      status: tx.signatures.size >= this.requiredSignatures ? 'ready' : 'pending'
    };
  }
}

module.exports = MultiSigService; 