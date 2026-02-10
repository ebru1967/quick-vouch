# ⚡ Vouch-Chain (Stellar Trust Protocol)

Vouch-Chain is a full-stack decentralized application (dApp) built on the Stellar Network. It allows users to give "trust votes" (vouches) to other wallets via on-chain transactions.

## 🚀 Features
- **Wallet Integration:** Connect with Freighter Wallet.
- **On-Chain Logic:** Every vouch is a real transaction on the Stellar Testnet with a specific Memo ("VOUCH").
- **Trust Score:** A backend service calculates the reputation score based on received vouches.
- **Full-Stack:** React (Frontend) + Node.js (Backend) + Stellar SDK.

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Stellar SDK, Freighter API
- **Backend:** Node.js, Express, Stellar Horizon API
- **Blockchain:** Stellar Testnet

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/vouch-chain.git](https://github.com/YOUR_GITHUB_USERNAME/vouch-chain.git)
cd vouch-chain

2. Backend Setup
cd backend
npm install
node index.js
The backend server will start on http://localhost:5001

3. Frontend Setup
Open a new terminal:
cd frontend
npm install
npm run dev
The application will run on http://localhost:5173

📖 Usage
Open the app and click "Connect Freighter Wallet".

Make sure your Freighter is on TESTNET.

Click "Profilim & Skor" to see your current trust score.

Use the "Vouch" feature to send 1 XLM (Testnet) to another user to increase their score.

📜 License
MIT License