<script>
  import detectEthereumProvider from "@metamask/detect-provider";
  import { onMount } from "svelte";

  export let signer = "";
  export let addresses = [];
  export let chainId = 0x1;
  export let autoconnect = "off";

  const networks = new Map([
    [
      1,
      {
        chainId: "0x1",
        chainName: "Ethereum",
        nativeCurrency: {
          name: "Ether",
          symbol: "ETH",
          decimals: 18
        },
        rpcUrls: ["https://mainnet.infura.io/v3"],
        blockExplorerUrls: ["https://etherscan.io"]
      }
    ],
    [
      0x89,
      {
        chainId: "0x89",
        chainName: "Polygon",
        nativeCurrency: {
          name: "Matic",
          symbol: "MATIC",
          decimals: 18
        },
        rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
        blockExplorerUrls: ["https://explorer-mainnet.maticvigil.com/"]
      }
    ]
  ]);

  async function connectNetwork() {
    console.log("connectNetwork", chainId);
    ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [networks.get(chainId)]
      })
      .catch((e) => console.error("ERROR wallet_addEthereumChain", e));
  }

  async function handleChainId(_chainId) {
    console.log("handleChainId <=", _chainId);
    if (_chainId) {
      console.log("_chainId", _chainId);
      if (_chainId != chainId) connectNetwork();
    }
  }
  async function handleAccounts(_accounts) {
    if (_accounts.length === 0) {
      if (autoconnect !== "off") connectMetamask();
    } else if (_accounts[0] !== signer) {
      signer = _accounts[0];
      if (addresses.indexOf(signer) === -1) {
        addresses.push(signer);
        console.log("handleAccounts", _accounts, "=>", signer, addresses);
      }
    }
  }
  async function connectMetamask() {
    console.log("connectMetamask");

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then(handleAccounts)
      .catch((e) => {
        if (e.code === 4001) {
          alert("Please connect to MetaMask.");
        } else {
          console.error("ERROR eth_requestAccounts", e);
        }
      });
  }
  onMount(async function () {
    console.log("init");
    const provider = await detectEthereumProvider();
    if (provider) {
      if (provider !== window.ethereum) {
        alert("Do you have multiple wallets installed?");
      }

      ethereum
        .request({ method: "eth_accounts" })
        .then(handleAccounts)
        .catch((e) => console.error("ERROR eth_accounts", e));

      ethereum
        .request({ method: "eth_chainId" })
        .then(handleChainId)
        .catch((e) => console.error("ERROR eth_chainId", e));

      ethereum.on("chainChanged", handleChainId);

      ethereum.on("accountsChanged", handleAccounts);
    } else {
      console.log("Please install MetaMask!");
    }
  });
</script>

<main>
  {#if signer}
    <div id="metamask-address">{signer}</div>
  {:else}
    <button on:click={connectMetamask}>Connect Metamask</button>
  {/if}
</main>
