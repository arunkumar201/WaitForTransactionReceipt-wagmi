import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  http,
  type Address,
  type Hash,
  type TransactionReceipt,
  createPublicClient,
  createWalletClient,
  custom,
  parseEther,
  stringify,
} from 'viem';
import { polygonAmoy } from 'viem/chains';
import 'viem/window';
import { key } from './constants';
const rpc = `https://polygon-amoy.g.alchemy.com/v2/${key}`;

//reciever address
//0x1cD3036909A50935002c2fb0e8D845472AE577F4
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http(''),
});
const walletClient = createWalletClient({
  chain: polygonAmoy,
  transport: custom(window.ethereum!),
});

function Example() {
  const [account, setAccount] = useState<Address>();
  const [hash, setHash] = useState<Hash>();
  const [receipt, setReceipt] = useState<TransactionReceipt>();

  const addressInput = React.createRef<HTMLInputElement>();
  const valueInput = React.createRef<HTMLInputElement>();

  const connect = async () => {
    const [address] = await walletClient.requestAddresses();
    setAccount(address);
  };

  const sendTransaction = async () => {
    if (!account) return;
    setReceipt(undefined);
    try {
      const hash = await walletClient.sendTransaction({
        account,
        to: addressInput.current!.value as Address,
        value: parseEther(valueInput.current!.value as `${number}`),
        chain: polygonAmoy,
      });
      setHash(hash);
    } catch (err) {
      alert(err);
      console.log(err);
    }
  };
  useEffect(() => {
    (async () => {
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 5,
          onReplaced: (res) => {
            console.log(res);
            alert('Tx Replaced');
          },
          retryDelay: 2000,
          retryCount: 10000,
          timeout: 1000 * 60 * 30,
        });
        setReceipt(receipt);
      }
    })();
  }, [hash]);

  if (account)
    return (
      <>
        <div>Connected: {account}</div>
        <input ref={addressInput} placeholder="address" />
        <input ref={valueInput} placeholder="value (ether)" />
        <button onClick={sendTransaction}>Send</button>
        {receipt && (
          <div>
            Receipt:{' '}
            <pre>
              <code>{stringify(receipt, null, 2)}</code>
            </pre>
          </div>
        )}
      </>
    );
  return (
    <>
      <button onClick={connect}>Connect Wallet</button>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />
);
