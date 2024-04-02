'use client'
import { useEffect, useState } from "react";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { decodeFirst } from "../utils/authHelper"
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
} from "@simplewebauthn/server";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { getBalanceByAddr, getWalletAddressPublicKey, updateAddressBytelegramId } from "../services/api";
import { AuthenWallet } from "../services/ton/tonService";
import { createPortal } from "react-dom";
import { Modall } from "./modal";
import { formatAddr } from "../utils/utils";
import { Wallet } from "./wallet";
import { Connect, connectModal } from "./Connect";

export function Login() {
  const [publicKey, setPublicKey] = useState<string>("");
  const [keyid, setKeyId] = useState("");
  const [error, setError] = useState("");
  const [telegramId, setTelegramId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [mainWalletAdress, setMainWalletAdress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [miniAppUrl, setMiniAppUrl] = useState("");
  const [loading, setLoading] = useState<boolean>(false);



  useEffect(() => {
    sessionCheck()
    let search = window.location.search;
    let searchData = new URLSearchParams(search).get('_data_') || 'query';
    let queryParameter = new URLSearchParams(searchData)
    setTelegramId(queryParameter.get('telegramId') || "")
    setMiniAppUrl(queryParameter.get('miniAppURL') || "")
  }, [])

  //TODO: Adding wallet binding check and api to finding binded main wallet address

  // webauthn registration
  async function register() {
    try {
      const timeNow = new Date()
      const generatedRegistrationOptions = await generateRegistrationOptions({
        rpName: "demo",
        rpID: window.location.hostname,
        userID: "Based Account " + timeNow.toISOString(),
        userName: "Based Account " + timeNow.toISOString(),
        attestationType: "direct",
        challenge: "asdf",
        supportedAlgorithmIDs: [-7],
      });
      const startRegistrationResponse = await startRegistration(
        generatedRegistrationOptions
      );
      const verificationResponse = await verifyRegistrationResponse({
        response: startRegistrationResponse,
        expectedOrigin: window.location.origin,
        expectedChallenge: generatedRegistrationOptions.challenge,
        supportedAlgorithmIDs: [-7],
      });
      if (!verificationResponse.registrationInfo) {
        return;
      }
      const { id } = startRegistrationResponse;
      const { credentialID, credentialPublicKey, counter } =
        verificationResponse.registrationInfo;

      const publicKey = decodeFirst<any>(credentialPublicKey);
      const kty = publicKey.get(1);
      const alg = publicKey.get(3);
      const crv = publicKey.get(-1);
      const x = publicKey.get(-2);
      const y = publicKey.get(-3);
      const n = publicKey.get(-1);
      localStorage.setItem(
        id,
        JSON.stringify({
          credentialID: Array.from(credentialID),
          credentialPublicKey: Array.from(credentialPublicKey),
          counter,
        })
      );
      const pk = compressPublicKey(publicKey)
      const _addr = getContractAddrByPk(pk)
      const _balance:any = await getBalanceByAddr(_addr)

      localStorage.setItem("user-registered", id);
      setKeyId(id);
      setPublicKey(pk)
      setAddress(_addr)
      setBalance(Math.floor(Number(_balance)/10**5)/10000)
    } catch (e) {
      setError((e as any).message || "An unknown error occured");
    }
  }
  async function sessionCheck() {
    const id = localStorage.getItem("user-registered");
    if(id) {
      const fetched = localStorage.getItem(id);
      if(fetched) {
        const authenticator = JSON.parse(fetched);
        const _publicKey = decodeFirst<any>(
          Uint8Array.from(authenticator.credentialPublicKey)
        );
        const pk = compressPublicKey(_publicKey)
        const _addr = getContractAddrByPk(pk)
        setPublicKey(pk)
        setKeyId(id)
        setAddress(_addr)
        
        //finding binding wallet
        const _mainWalletAdress:any = await getWalletAddressPublicKey(pk)
        setMainWalletAdress(_mainWalletAdress.contractAddress)
        const _balance:any = await getBalanceByAddr(_addr)
        if(_balance) {
          setBalance(Math.floor(Number(_balance)/10**5)/10000)
        }
      }
    }
    return
  }

  //Using connecting wallet and sign message
  async function login() {
    try {
      const authenticationOptions = await generateAuthenticationOptions({
        rpID: window.location.hostname,
        challenge: "authenGood",  
      });
      const authenticationResponse = await startAuthentication(
        authenticationOptions
      );

      //@TODO: we need store this credential in telegram or other place?
      const fetched = localStorage.getItem(authenticationResponse.id);
      if (!fetched) {
        alert("Credential not stored. Please try registering again!")
        return
      }

      const authenticator = JSON.parse(fetched);

      const _publicKey = decodeFirst<any>(
        Uint8Array.from(authenticator.credentialPublicKey)
      );

      try{
        setLoading(true)
        const pk = compressPublicKey(_publicKey)
        const _addr = getContractAddrByPk(pk)
        const _balance:any = await getBalanceByAddr(_addr)
        setPublicKey(pk)
        setAddress(_addr);
        setBalance(Math.floor(Number(_balance)/10**5)/10000)
        setLoading(false)
      } catch(ee) {
        setLoading(false)
        console.log(ee)
      }
      localStorage.setItem("user-registered", authenticationResponse.id);
      setKeyId(authenticationResponse.id);
    } catch (e) {
      console.log(e)
    }
  }

  async function connect() {
    const pk = (publicKey)
    const authenWallet = new AuthenWallet(0 ,pk, 9453)
    await updateAddressBytelegramId(telegramId, pk, authenWallet.address.toString(), keyid)
    window.location.href = (miniAppUrl)
  }

  function logout() {
    localStorage.removeItem("user-registered");
    setKeyId("");
    setPublicKey("")
    setAddress("");
    setBalance(0);
  }

  const closeModal = () => {setLoading(false)}

  return (
    <Card style={{"height": window.innerHeight, "backgroundColor": "rgba(39, 40, 46)", maxWidth: "400px"}} className= "madimi-one-regular">
      <FlexBoxCol>
        <FlexBoxRow className="justify-between">
          <h3>Authen Wallet</h3>
            {keyid==""?
              <></>
              :
              <div>
                <button className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" onClick={logout}>
                  Logout
                </button>
              </div>
            }
        </FlexBoxRow>
        {keyid==""?
          <FlexBoxRow>
            <Button onClick={register}>
              Register new account
            </Button>
            <Button onClick={login}>
              Login
            </Button>
          </FlexBoxRow>
          :
          <></>
        }
        {keyid!=""?
          <Wallet address={mainWalletAdress} balance={balance} publicKey={publicKey} authenId={keyid} setLoading={setLoading} />
          :
          <></>
          }
          {keyid!=""&&telegramId!=""?
          <FlexBoxRow>
            <Connect connecthandler={connect} />
          </FlexBoxRow>
          :
          <></>
        }
      </FlexBoxCol>
      {loading&&createPortal(<Modall closeModal= {closeModal} message= {"Loading"} />, document.body)}
    </Card>
  );
}

function getContractAddrByPk(publicKey: any) {
  try {
    const authenWallet = new AuthenWallet(0 ,publicKey, 9453)
    return authenWallet.address.toString()
  } catch(e) {
    console.log(e)
    return ""
  }
}

//inputs type: bigint
function compressPublicKey(publicKey:any) {
  const x = publicKey.get(-2);
  const y = publicKey.get(-3);
  const pubKeyX:any = BigInt('0x' + Array.from(new Uint8Array(x)).map(x => x.toString(16).padStart(2, '0')).join(''))
  const pubKeyY = BigInt('0x' + Array.from(new Uint8Array(y)).map(x => x.toString(16).padStart(2, '0')).join(''))

  const yBit = pubKeyY % 2n === 0n ? 0x02 : 0x03;
  const compressedPubKey = [yBit].concat(pubKeyX);
  return compressedPubKey.map(x => x.toString(16).padStart(2, '0')).join('');
}