import { Account, NetworkType } from "tsjs-xpx-chain-sdk";

const newAccount = Account.generateNewAccount(NetworkType.TEST_NET, 1);

console.log("New Account Private Key:", newAccount.privateKey);
console.log("New Account Address:", newAccount.address.pretty());
