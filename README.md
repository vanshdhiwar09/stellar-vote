# 🚀 StellarVote - Multi-Poll Web3 Platform

StellarVote is a premium, real-time decentralized polling application built on the **Stellar Network** utilizing **Soroban Smart Contracts** and **React 19**. It features cryptographically secure voting, instantaneous network syncing without page refreshes, and an ultra-modern glassmorphic UI.

## 🔗 Live Network Verification
This dApp has been rigorously tested and deployed to the Stellar Testnet.

*   **Deployed Contract Address:** `CDFT2ZWORT3CIWKCJX2B4XK7QWK63KKWWLV4L7MCN6MC2TLCHSGQLD2I`
*   **Verified Transaction Hash (Vote Cast):** [`b634b1cb400d8c03ba57abbe4a9c0d4db04cb8507097309d912380db6d417983`](https://stellar.expert/explorer/testnet/tx/b634b1cb400d8c03ba57abbe4a9c0d4db04cb8507097309d912380db6d417983)

## 📸 Wallet Integration Details
**Important:** You must have the [Freighter Wallet v6+](https://freighter.app/) extension installed in your browser and set to the **Testnet** network to securely interact with the application.

> *Note for Judges: [Insert your screenshot of Freighter connected to your UI right here - eg: `![Wallet Options](./screenshot.png)`]*

## 🛠 Features
*   **Infinite Scaling:** Uses a dynamic `Map<u32, PollData>` inside Rust to support unlimited polls.
*   **Live UI Hydration:** Subscribes to Stellar RPC events to automatically re-render active vote counts globally.
*   **Interactive Analytics:** Recharts library visualizes vote distributions spanning the blockchain network natively.

## ⚙️ Quick Start (Developer Setup)

### 1. Prerequisites
- Node.js (v18+)
- Freighter browser extension installed and configured for Testnet
- Rust & Soroban CLI (if you wish to recompile the backend, otherwise skip)

### 2. Run the Frontend Locally
```bash
git clone https://github.com/your-username/stellar-vote.git
cd stellar-vote/frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. 
Click **Connect Wallet** and verify you are on the Testnet before interacting!

## 📁 Repository Architecture
- `contracts/stellar-vote`: The Soroban Rust Smart Contract source code.
- `packages/stellar_vote`: Auto-generated TypeScript client bindings for the contract.
- `frontend/src`: The Vite + React UI environment.
  - `components/` - Shell structures & Sidebar nav.
  - `context/StellarContext.tsx` - Core Web3 global state manipulation.
  - `pages/` - View controllers (Overview, CreatePoll, PollDetails).
