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
import { getBalanceByAddr, updateAddressBytelegramId } from "../services/api";
import { AuthenWallet } from "../services/ton/tonService";

export function Login() {
  const [publicKey, setPublicKey] = useState("");
  const [keyid, setKeyId] = useState("");
  const [error, setError] = useState("");
  const [telegramId, setTelegramId] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);


  useEffect(() => {
    sessionCheck()
    let search = window.location.search;
    let searchData = new URLSearchParams(search).get('_data_') || 'query';
    let queryParameter = new URLSearchParams(searchData)
    setTelegramId(queryParameter.get('telegramId') || "")
  }, [])

  // webauthn registration
  async function createNewCredential() {
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

      localStorage.setItem("user-registered", id);
      setKeyId(id);
      setPublicKey(publicKey)
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
        const _addr = getContractAddrByPk(_publicKey)
        const _balance:any = await getBalanceByAddr("UQCjtNnN9XeH2T12uHGdzpDN-iFNKNWapI1jWgJoXvWP-ZoT")
        setPublicKey(_publicKey)
        setKeyId(id)
        setAddress(_addr)
        setBalance(Math.floor(Number(_balance)/10**5)/10000)
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
      
      const _addr = getContractAddrByPk(_publicKey)
      const _balance:any = await getBalanceByAddr(_addr)
      localStorage.setItem("user-registered", authenticationResponse.id);
      setKeyId(authenticationResponse.id);
      setPublicKey(_publicKey)
      setAddress(_addr);
      setBalance(Math.floor(Number(_balance)/10**5)/10000)
    } catch (e) {
      console.log(e)
    }
  }

  async function connect() {
    const pk = compressPublicKey(publicKey)
    const authenWallet = new AuthenWallet(0 ,pk, 9453)
    updateAddressBytelegramId(telegramId, publicKey, authenWallet.address.toString())
  }

  function logout() {
    localStorage.removeItem("user-registered");
    setKeyId("");
    setPublicKey("")
  }

  return (
    <Card>
      <FlexBoxCol>
        <h3>Authen Wallet</h3>
          {keyid!=""&&telegramId==""?
          <>
           <p>Address: {address}</p>
           <p>Balance: {balance} Ton</p>
          </>
          :
          <></>
          }
          {keyid!=""&&telegramId!=""?
          <FlexBoxRow>
            <Button onClick={connect}>
              Connect Wallet
            </Button>
          </FlexBoxRow>
          :
          <></>
          }
          {keyid==""?
          <FlexBoxRow>
            <Button onClick={createNewCredential}>
              Register new account
            </Button>
            <Button onClick={login}>
              Login
            </Button>
          </FlexBoxRow>
          :
          <FlexBoxRow>
            <Button onClick={logout}>
              Logout
            </Button>
          </FlexBoxRow>
          }
      </FlexBoxCol>
    </Card>
  );
}

function getContractAddrByPk(publicKey: any) {
  try {
    const pk = compressPublicKey(publicKey)
    const authenWallet = new AuthenWallet(0 ,pk, 9453)
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