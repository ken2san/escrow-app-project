# Escrow App

Escrow App is a modern web application designed to facilitate secure transactions between clients and contractors. It provides tools for project management, milestone tracking, fund deposits, and AI-powered recommendations.

## Features

- Create and manage projects
- Milestone-based progress tracking
- Secure fund deposits and releases
- AI-powered project recommendations
- Multilingual support (English and Japanese)
- Secure contract and evidence management

## Technology Stack

- Frontend: React, React Router, Tailwind CSS
- Backend: Node.js (API not yet implemented)
- Data Persistence: LocalStorage
- Infrastructure: Docker, Nginx

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd escrow_app_project
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

4. To build and run the app using Docker:

   ```bash
   docker-compose up --build
   ```

5. Access the app:
   - Development: `http://localhost:3000`
   - Docker: `http://localhost`

## Blockchain Integration (local testing)

This project can be connected to a local Hardhat (v3) development chain for end-to-end UI testing with smart contracts. For automated agents or external teams that will prepare contract artifacts and a local node, see `BLOCKCHAIN_AGENT_README.md` for the exact packaging and environment variables the frontend expects.

Quick steps:

- Start a Hardhat node and deploy contracts (in the separate Hardhat workspace):

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

- In this project, create `.env.local` with:

```
REACT_APP_RPC_URL=http://127.0.0.1:8545
REACT_APP_POINTS_ADDR=<DEPLOYED_POINTS_MANAGER_ADDRESS>
```

- Start the frontend:

```bash
npm start
```

## Usage

1. **Create a Project**
   Navigate to the "New Project" page to create a project.

2. **Set Milestones**
   Add milestones to your project to track progress.

3. **Deposit Funds**
   Deposit funds based on the agreed contract terms.

4. **Use AI Recommendations**
   Leverage AI to get project recommendations.

5. **Complete Contracts**
   Release funds upon milestone completion to finalize contracts.

## License

This project is licensed under the [MIT License](LICENSE).
