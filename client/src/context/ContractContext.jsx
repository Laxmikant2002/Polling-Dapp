import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ABI from '../contracts/Abi.json';
import { toast } from 'sonner';

const ContractContext = createContext();

export { ContractContext };

export const ContractProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVoter, setIsVoter] = useState(false);
  const [isCandidate, setIsCandidate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(provider);

          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            process.env.REACT_APP_CONTRACT_ADDRESS,
            ABI,
            signer
          );
          setContract(contract);

          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            await checkRoles(accounts[0], contract);
          }

          window.ethereum.on('accountsChanged', async (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
              await checkRoles(accounts[0], contract);
            } else {
              setAccount(null);
              setIsAdmin(false);
              setIsVoter(false);
              setIsCandidate(false);
            }
          });
        }
      } catch (error) {
        console.error('Error initializing contract:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const checkRoles = async (address, contract) => {
    try {
      const [admin, voter, candidate] = await Promise.all([
        contract.isAdmin(address),
        contract.isVoter(address),
        contract.isCandidate(address)
      ]);

      setIsAdmin(admin);
      setIsVoter(voter);
      setIsCandidate(candidate);
    } catch (error) {
      console.error('Error checking roles:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkRoles(accounts[0], contract);
          return accounts[0];
        }
      } else {
        throw new Error('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  };

  const verifyUser = async (userId, userType) => {
    try {
      if (!isAdmin) {
        throw new Error('Only admin can verify users');
      }

      if (userType === 'voter') {
        await contract.verifyVoter(userId);
      } else if (userType === 'candidate') {
        await contract.verifyCandidate(userId);
      } else {
        throw new Error('Invalid user type');
      }

      // Refresh roles after verification
      await checkRoles(account, contract);
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  };

  const value = {
    account,
    contract,
    provider,
    isAdmin,
    isVoter,
    isCandidate,
    isLoading,
    connectWallet,
    verifyUser
  };

  return (
    <ContractContext.Provider value={value}>
      {children}
    </ContractContext.Provider>
  );
};

export const useContract = () => {
  const context = useContext(ContractContext);
  if (!context) {
    throw new Error('useContract must be used within a ContractProvider');
  }
  return context;
};