import * as ethers from "ethers";

// the aavegotchi contract abi from the official github
import aavegotchiDiamondAbi from "../../aavegotchi-contracts/diamondABI/diamond"

// https://github.com/aavegotchi/aavegotchi-contracts in the readme.md
const aavegotchiDiamondAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d';

// constants (presets)
const guildAddress = '0x53a75d41bfc6b5F9E4D4F9769eb12CF58904F37a';
const splits = [25,70,5]; // 25% lender, 70% borrower, 5% guild
const duration = 43200; // 12h
const upfront = 0; // no upfront cost
const whitelistId = 871;
const tokens = [
    "0x403E967b044d4Be25170310157cB1A4Bf10bdD0f",
    "0x44a6e0be76e1d9620a7f76588e4509fe4fa8e8c8",
    "0x6a3e7c3c6ef65ee26975b12293ca1aad7e1daed2",
    "0x42e5e06ef5b90fe15f853f59299fc96259209c5c"
]; // tokens included in revenue that is shared

// get web3 provider
let provider = new ethers.providers.Web3Provider(window.ethereum);

// since lending spends funds, this will require getting their signer approval and opens a popup,
async function addGotchiLending() {

  if (provider) {

    // our metamask in the browser should have already been on the matic network btw
    // authorizing the account will allow our site to spend for this smart contract
    // [!]
    // [!] very important to only approve this after vetting the app you are using
    // [!]
    // explicitly request the wallet address, it returns an array of the ones approved so we take the first
    // if the user accepts, signer variable now holds their active wallet address
    let aavegotchiContract = await new ethers.Contract(
      // we supply the contract address, contract abi, and the provider with our connection to matic
      aavegotchiDiamondAddress, aavegotchiDiamondAbi, provider.getSigner()
    );

    if (aavegotchiContract) {

      // So now we have permission to call the contract with our wallet, lets first get the gotchis.
      // to do this first we need to know who's wallet we're looking for.
      // Our wallet is always a good choice, this will prompt you to connect to your site and reveal the account.
      let accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const owner = accounts[0];

      // In the AavegotchiFacet lib there is a function called tokenIdsOfOwner()
      // this is useful because as mentioned above we can start by finding all the gotchis owned which this does exactly
      let gotchis = await aavegotchiContract.tokenIdsOfOwner(owner);


      if (gotchis.length > 0) {
        console.log("The gotchis owned by ", owner, "are ", gotchis);

        // use the last gotchi for the demo, will need to be able to select or
        // input the id 
        const gotchi = gotchis[gotchis.length - 1];

        // its just another function call away from it's name. the abi hooked things up behind the scenes
        // [!] Remember because this broadcasts a transaction, it requires your approval
        aavegotchiContract.addGotchiLending(
            gotchi,
            upfront,
            duration,
            splits,
            owner,
            guildAddress,
            whitelistId,
            tokens
        );


        // excellent, now be patient for a sec since Matic is fast.
        // Once your transaction confirms, you can check that is it lended.


      }

    }

  }

}

// triggers the function when our button is clicked
document.getElementById("lend_gotchi").onclick = addGotchiLending
