const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

const ipfs = create({
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      `${process.env.IPFS_PROJECT_ID}:${process.env.IPFS_PROJECT_SECRET}`
    ).toString('base64')}`
  }
});

const uploadToIPFS = async (data) => {
  try {
    const result = await ipfs.add(JSON.stringify(data));
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

const getFromIPFS = async (hash) => {
  try {
    const stream = ipfs.cat(hash);
    let data = '';
    
    for await (const chunk of stream) {
      data += chunk.toString();
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
};

const storeVoteMetadata = async (voteData) => {
  try {
    const metadata = {
      timestamp: Date.now(),
      electionId: voteData.electionId,
      candidateId: voteData.candidateId,
      voterId: voteData.voterId,
      verificationHash: voteData.verificationHash
    };

    const ipfsHash = await uploadToIPFS(metadata);
    return ipfsHash;
  } catch (error) {
    console.error('Error storing vote metadata:', error);
    throw error;
  }
};

const verifyVoteMetadata = async (ipfsHash, expectedData) => {
  try {
    const storedData = await getFromIPFS(ipfsHash);
    return JSON.stringify(storedData) === JSON.stringify(expectedData);
  } catch (error) {
    console.error('Error verifying vote metadata:', error);
    throw error;
  }
};

module.exports = {
  uploadToIPFS,
  getFromIPFS,
  storeVoteMetadata,
  verifyVoteMetadata
}; 