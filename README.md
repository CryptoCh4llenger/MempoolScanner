# Ethereum Wallet Mempool Scanner (Educational Purpose Only)
## Note: This script is for educational purposes only and is intended to provide insights into the workings of a malicious script. It should not be used for any malicious or unauthorized activities.

# How It Works
1. Connects to the Ethereum network using the provided Infura WebSocket endpoint.
2. Monitors the mempool to identify pending transactions targeting the wallet address.
3. When the pending transaction is validated, the script automatically initiates a transfer of the entire ETH balance to the recipient's address.
4. Verifies that the wallet has enough funds to cover the gas fee.
5. Signs and sends the transaction using the wallet's private key.
6. Updates the wallet state by checking for new blocks and scanning the mempool.
