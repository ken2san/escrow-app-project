# Milestone: Blockchain-Ready Point System UI Mockup

## Purpose

Create a UI/UX mockup for the point system and payment flow that clearly communicates the intended blockchain integration and user experience to both engineers and stakeholders. This milestone will serve as a foundation for future backend and smart contract integration.

## Scope & Features

### 1. Payment Method Selection UI

- Add radio buttons or tabs in the point purchase modal for payment method selection:
  - Credit Card
  - PayPal
  - Bank Transfer
  - Cryptocurrency (e.g., ETH, USDT)
- Show relevant input fields and instructions for each method
- For crypto, display a wallet address and QR code

### 2. Blockchain Address & Tx Hash Display

- Show dummy wallet addresses and transaction hashes (e.g., 0x123...abcd) in purchase/send/receive flows
- Add an "Etherscan-style" link (dummy) for each Tx hash
- Display Tx hashes in the point history list

### 3. Blockchain Recording Animation/Feedback

- Show animations/messages like "Sending transaction...", "Block being generated..."
- On completion, display a message/icon: "Recorded on blockchain!"
- Add "On-chain" labels to balances and history entries

### 4. Send/Receive UI

- Add a modal for sending points:
  - Input for recipient wallet address
  - Input for amount
  - Send button (generates dummy Tx hash)
- Add a modal for receiving points:
  - Show user's wallet address and QR code

### 5. General UI/UX

- Sidebar/dashboard shows wallet address, on-chain balance, and point history
- All blockchain-related UI is clearly labeled and visually distinct

## Deliverables

- Updated React components and modals reflecting the above features (mock/dummy data OK)
- No backend or smart contract integration required at this stage
- Code and UI should be easily extendable for future real blockchain connection

## How to Proceed

To implement this milestone efficiently, follow these steps:

1. **Enhance Wallet & Balance UI**

- Add wallet address, on-chain balance, and sync button to the sidebar or dashboard.

2. **Upgrade Point Purchase Modal**

- Implement payment method selection UI and relevant input fields.
- Add dummy blockchain address/QR code for crypto payments.

3. **Add Blockchain Details to Point History**

- Display dummy Tx hashes, Etherscan-style links, and on-chain labels in the history modal.

4. **Implement Send/Receive Modals**

- Create modals for sending and receiving points, with address/amount input and QR code display.

5. **Add Blockchain Recording Animations/Feedback**

- Show transaction progress and completion messages/animations in relevant modals.

6. **Review & Refine**

- Test the UI, gather feedback, and iterate for clarity and usability.

You can implement these steps in any order, but starting with the most visible and reusable components is recommended. Track your progress by checking off each step as you complete it.

---

This milestone is for demonstration and technical communication purposes. Actual payment and blockchain logic will be implemented in later milestones.
