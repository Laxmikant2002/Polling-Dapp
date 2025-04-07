#!/bin/bash

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../client
npm install

# Install smart contract dependencies
echo "Installing smart contract dependencies..."
cd ..
npm install

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p logs
mkdir -p server/logs

# Set up environment variables
echo "Setting up environment variables..."
if [ ! -f ".env" ]; then
    echo "INFURA_PROJECT_ID=your_infura_project_id" > .env
    echo "INFURA_URL=https://sepolia.infura.io/v3/your_infura_project_id" >> .env
    echo "PRIVATE_KEY=your_private_key" >> .env
    echo "Please update the .env file with your actual values"
fi

if [ ! -f "client/.env" ]; then
    echo "REACT_APP_CONTRACT_ADDRESS=your_contract_address" > client/.env
    echo "REACT_APP_NETWORK_ID=31337" >> client/.env
    echo "REACT_APP_EMAIL_USER=your_email" >> client/.env
    echo "REACT_APP_EMAIL_PASS=your_email_password" >> client/.env
    echo "Please update the client/.env file with your actual values"
fi

echo "Setup complete! Please update the .env files with your actual values before running the project." 