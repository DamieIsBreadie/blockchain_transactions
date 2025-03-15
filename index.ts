// import {
//     Account,
//     Deadline,
//     NetworkType,
//     PlainMessage,
//     TransferTransaction,
//     TransactionHttp,
//   } from "tsjs-xpx-chain-sdk";
//   import dotenv from "dotenv";
  
//   dotenv.config();
  
//   const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
//   const NODE_URL = "https://api-2.testnet2.xpxsirius.io";
//   const GENERATION_HASH = "56D112C98F7A7E34D1AEDC4BD01BC06CA2276DD546A93E36690B785E82439CA9";
  
//   const senderAccount = Account.createFromPrivateKey(PRIVATE_KEY, NetworkType.TEST_NET);
//   const recipientAddress = senderAccount.address; // self-address clearly for testing
  
//   const transferTransaction = TransferTransaction.create(
//     Deadline.create(),
//     senderAccount.address, // clearly sending to your own account
//     [],
//     PlainMessage.create("More Final Test :D"),
//     NetworkType.TEST_NET,
//   );
  
//   const signedTransaction = senderAccount.sign(transferTransaction, GENERATION_HASH);
//   console.log("Signed Transaction Hash:", signedTransaction.hash);
  
//   const transactionHttp = new TransactionHttp(NODE_URL);
  
//   transactionHttp.announce(signedTransaction).subscribe(
//     () => {
//       console.log("Transaction announced successfully! Hash:", signedTransaction.hash);
//     },
//     (err) => {
//       console.error("Transaction failed:", err);
//     }
//   );

import {
  Account,
  Deadline,
  NetworkType,
  PlainMessage,
  TransferTransaction,
  TransactionHttp,
} from "tsjs-xpx-chain-sdk";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const NODE_URL = "https://api-2.testnet2.xpxsirius.io";
const GENERATION_HASH = "56D112C98F7A7E34D1AEDC4BD01BC06CA2276DD546A93E36690B785E82439CA9";

// Accept input parameters (post_id, ai_score, checked_score)
const args = process.argv.slice(2);
const postId = args[0];
const aiScore = args[1];
const checkedScore = args[2];

if (!postId || !aiScore || !checkedScore) {
  console.error("Missing required parameters: post_id, ai_score, checked_score");
  process.exit(1);
}

// Format data into a structured message
const messageContent = `Post ID: ${postId}, AI Score: ${aiScore}, Checked Score: ${checkedScore}`;


const senderAccount = Account.createFromPrivateKey(PRIVATE_KEY, NetworkType.TEST_NET);
const recipientAddress = senderAccount.address; // self-address clearly for testing

const transferTransaction = TransferTransaction.create(
  Deadline.create(),
  senderAccount.address, // clearly sending to your own account
  [],
  PlainMessage.create(messageContent),
  NetworkType.TEST_NET,
);

const signedTransaction = senderAccount.sign(transferTransaction, GENERATION_HASH);
console.log("Signed Transaction Hash:", signedTransaction.hash);

const transactionHttp = new TransactionHttp(NODE_URL);

transactionHttp.announce(signedTransaction).subscribe(
  () => {
    console.log("Transaction announced successfully! Hash:", signedTransaction.hash);

    // Send the signed transaction hash back to the Python API
    console.log(JSON.stringify({ transactionHash: signedTransaction.hash })); // ✅ Output JSON result
  },
  (err) => {
    console.error("Transaction failed:", err);
  }
);


