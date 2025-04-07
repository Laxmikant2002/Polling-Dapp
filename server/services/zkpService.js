const snarkjs = require('snarkjs');
const crypto = require('crypto');
const MultiSigService = require('./services/multiSigService');

class ZKPService {
  constructor() {
    this.circuit = null;
    this.provingKey = null;
    this.verificationKey = null;
  }

  async initialize() {
    // Load circuit and keys
    this.circuit = await snarkjs.loadCircuit('circuits/vote_verification.json');
    this.provingKey = await snarkjs.loadProvingKey('circuits/vote_verification_proving_key.json');
    this.verificationKey = await snarkjs.loadVerificationKey('circuits/vote_verification_verification_key.json');
  }

  generateVoteProof(voteData) {
    const { electionId, candidateId, voterId, secret } = voteData;

    // Create input for the circuit
    const input = {
      electionId: this.hashToField(electionId),
      candidateId: this.hashToField(candidateId),
      voterId: this.hashToField(voterId),
      secret: this.hashToField(secret)
    };

    // Generate proof
    const { proof, publicSignals } = snarkjs.groth16.prove(
      this.circuit,
      this.provingKey,
      input
    );

    return {
      proof,
      publicSignals
    };
  }

  verifyVoteProof(proof, publicSignals) {
    return snarkjs.groth16.verify(
      this.verificationKey,
      publicSignals,
      proof
    );
  }

  generateVoteHash(voteData) {
    const { electionId, candidateId, voterId, timestamp } = voteData;
    const data = `${electionId}-${candidateId}-${voterId}-${timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  hashToField(input) {
    const hash = crypto.createHash('sha256').update(input.toString()).digest('hex');
    return BigInt(`0x${hash}`) % BigInt(21888242871839275222246405745257275088548364400416034343698204186575808495617);
  }

  generateSecret() {
    return crypto.randomBytes(32).toString('hex');
  }

  async verifyVote(voteData, proof, publicSignals) {
    // Verify the zero-knowledge proof
    const proofValid = await this.verifyVoteProof(proof, publicSignals);
    if (!proofValid) {
      throw new Error('Invalid proof');
    }

    // Verify the vote hash matches
    const voteHash = this.generateVoteHash(voteData);
    if (voteHash !== publicSignals[0]) {
      throw new Error('Vote hash mismatch');
    }

    // Additional verifications can be added here
    // For example, checking if the voter is eligible, if the election is active, etc.

    return true;
  }
}

module.exports = new ZKPService(); 