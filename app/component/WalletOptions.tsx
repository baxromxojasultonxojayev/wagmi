"use client";

import React, { useEffect, useState } from "react";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAddress,
  useEnsName,
} from "wagmi";
import { normalize } from "viem/ens";
import { useEthersSigner } from "../utils/ethers";
import { ethers } from "ethers";

const WalletOptions = () => {
  const signer = useEthersSigner();
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();
  const result = useEnsAddress({
    name: normalize("wevm.eth"),
  });
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address: address });
  const [ethBalance, setEthBalance] = useState<string | null>(null);

  const getBalance = async () => {
    if (signer) {
      try {
        const balance = await signer.getBalance();
        setEthBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  // Function to get ERC20 token balance

  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);

  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const getTokenBalance = async () => {
    if (signer && tokenAddress) {
      console.log("salom");

      try {
        // Create a contract instance with the token address and ABI
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ERC20_ABI,
          signer
        );

        // Fetch the token balance for the connected address
        const balance = await tokenContract.balanceOf(address);

        // Fetch the token decimals to correctly format the balance
        const decimals = await tokenContract.decimals();

        const formattedBalance = ethers.utils.formatUnits(balance, decimals);
        setTokenBalance(formattedBalance);
        console.log("formattedBalance", formattedBalance);
      } catch (error) {
        console.error("Error fetching token balance:", error.message);
      }
    }
  };

  useEffect(() => {
    getBalance();
  }, [isConnected, address, signer]);

  return (
    <div className="container">
      <div className="wallet-section">
        <h1>Connect Wallet</h1>
        {!isConnected ? (
          <div className="">
            {connectors.map((connector) => (
              <button
                className="connect-btn"
                key={connector.id}
                onClick={() => connect({ connector })}
              >
                Connect Wallet
              </button>
            ))}
          </div>
        ) : (
          <div>
            <button className="connect-btn" onClick={() => disconnect()}>
              Disconnect
            </button>
          </div>
        )}
        <div className="wallet-info">
          <p>
            <strong>
              Connected Address:
              {address ? (
                <div>{ensName ? `${ensName} (${address})` : address}</div>
              ) : (
                <span id="address">Not Connected</span>
              )}
            </strong>{" "}
          </p>
          <p>
            <strong>Network:</strong>{" "}
            <span id="network">
              {" "}
              {address ? result?.queryKey[1].name : "Unknown"}{" "}
            </span>
          </p>
          <p>
            <strong>ETH Balance:</strong>{" "}
            {address ? ethBalance && `${ethBalance} ETH` : "0.0000 ETH"}
          </p>
        </div>
      </div>
      {signer && (
        <div className="token-section">
          <h2>Check ERC20 Token Balance</h2>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="Enter ERC20 Token Address"
            className="token-input"
          />
          <button className="check-btn" onClick={getTokenBalance}>
            Check Balance
          </button>
          {/* <input
          type="text"
          placeholder="Enter ERC20 Token Address"
          className="token-input"
        />
        <button className="check-btn">Check Balance</button> */}
          <div className="token-info">
            <p>
              {/* <strong>Token Balance:</strong>{" "} */}
              <p>
                <strong>Token Balance:</strong>{" "}
                {tokenBalance ? `${tokenBalance} Tokens` : "0.0000 Tokens"}
                {console.log(tokenAddress)}
              </p>
              {/* <span id="token-balance">0.0000 Tokens</span> */}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletOptions;
