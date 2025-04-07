# Blockchain-based Voting System

A decentralized voting application built with Ethereum, React.js, Tailwind CSS, and ethers.js. This system provides a secure, transparent, and tamper-proof voting platform.

## Features

- Secure blockchain-based voting
- Real-time vote counting and results
- Voter verification and authentication
- Admin dashboard for election management
- QR code-based vote verification
- Responsive and modern UI

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MetaMask wallet
- MongoDB
- Hardhat (for smart contract development)

## Project Structure

```
voting-dapp/
├── client/                 # React frontend
├── server/                 # Node.js backend
├── contracts/              # Smart contracts
├── test/                   # Smart contract tests
└── scripts/                # Deployment and interaction scripts
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd voting-dapp
```

### 2. Install Dependencies

#### Backend Setup
```bash
cd server
npm install
```

#### Frontend Setup
```bash
cd client
npm install
```

### 3. Environment Configuration

#### Backend (.env)
Create a `.env` file in the server directory with:
```
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-password>
CLIENT_URL=http://localhost:3000
```

#### Frontend (.env)
Create a `.env` file in the client directory with:
```
REACT_APP_CONTRACT_ADDRESS=<your-contract-address>
REACT_APP_NETWORK_ID=31337
REACT_APP_EMAIL_USER=<your-email>
REACT_APP_EMAIL_PASS=<your-email-password>
```

### 4. Smart Contract Deployment

1. Start local blockchain:
```bash
npx hardhat node
```

2. Deploy smart contract:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. Update the contract address in your frontend .env file

## Running the Application

### 1. Start the Backend Server

```bash
cd server
npm start
```

The server will run on http://localhost:5000

### 2. Start the Frontend Development Server

```bash
cd client
npm start
```

The frontend will run on http://localhost:3000

## Usage Guide

1. **Connect Wallet**
   - Open the application in your browser
   - Click "Connect with MetaMask"
   - Approve the connection request

2. **Voter Registration**
   - Navigate to the registration page
   - Fill in your details
   - Upload required documents
   - Complete the verification process

3. **Voting Process**
   - Browse available elections
   - Select an active election
   - Choose your candidate
   - Confirm your vote
   - Receive a verification QR code

4. **Admin Dashboard**
   - Create new elections
   - Manage candidates
   - Monitor voting progress
   - View real-time results

## Security Features

- Smart contract-based vote verification
- Encrypted voter data
- Two-factor authentication
- Blockchain transaction verification
- Secure session management

## Testing

### Smart Contract Tests
```bash
npx hardhat test
```

### Frontend Tests
```bash
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@blockvote.com or open an issue in the repository.
