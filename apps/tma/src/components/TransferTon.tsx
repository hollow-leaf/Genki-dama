import { useEffect, useState } from "react";
import styled from "styled-components";
import { Address, toNano } from "ton";
import { useTonConnect } from "../hooks/useTonConnect";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { useSearchParams } from "react-router-dom";
import { decodeFirst, concatUint8Arrays, parseAuthenticatorData, shouldRemoveLeadingZero } from "../utils/authHelper"
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import base64 from "@hexagon/base64";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnParser } from "@peculiar/asn1-schema";
import {
  startAuthentication,
} from "@simplewebauthn/browser";

export function TransferTon() {
  const [error, setError] = useState("");
  const [miniAppUrl, setMiniAppUrl] = useState("");
  const [miniAppToken, setMiniAppToken] = useState("");
  const [tonAmount, setTonAmount] = useState("");
  const [tonRecipient, setTonRecipient] = useState(
    "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
  );

  useEffect(() => {
    let search = window.location.search;
    let searchData = new URLSearchParams(search).get('_data_') || 'query';
    let queryParameter = new URLSearchParams(searchData)
    setMiniAppUrl(queryParameter.get('miniAppURL') || "")
    setMiniAppToken(queryParameter.get('miniAppToken') || "")
    setTonRecipient(queryParameter.get('recipient') || "")
    setTonAmount(queryParameter.get('amount') || "")
  }, [])

  function compressPublicKey(pubKeyX: any, pubKeyY: any) {
    const yBit = pubKeyY % 2n === 0n ? 0x02 : 0x03;
    const compressedPubKey = [yBit].concat(pubKeyX);
    return compressedPubKey.map(x => x.toString(16).padStart(2, '0')).join('');
  }

  // webauthn authenticate
  async function authenticate(transaction: Uint8Array) {
    setError("");
    try {
      const authenticationOptions = await generateAuthenticationOptions({
        rpID: window.location.hostname,
        challenge: transaction,
      });
      const authenticationResponse = await startAuthentication(
        authenticationOptions
      );
      const clientDataJSON = base64.toArrayBuffer(
        authenticationResponse.response.clientDataJSON,
        true
      );
      const authenticatorData = base64.toArrayBuffer(
        authenticationResponse.response.authenticatorData,
        true
      );
      const signature = base64.toArrayBuffer(
        authenticationResponse.response.signature,
        true
      );
      const parsed = parseAuthenticatorData(new Uint8Array(authenticatorData));

      const hashedClientData = await window.crypto.subtle.digest(
        "SHA-256",
        clientDataJSON
      );
      const preimage = concatUint8Arrays(
        new Uint8Array(authenticatorData),
        new Uint8Array(hashedClientData)
      );
      const hashedMessage = await window.crypto.subtle.digest(
        "SHA-256",
        preimage
      );

      console.log({
        clientDataJSON,
        authenticationOptions,
        authenticationResponse,
        parsed,
        hashedMessage,
        hashedClientData,
        preimage,
        signature: new Uint8Array(signature),
      });
      console.log(authenticationResponse.id)
      //@TODO: we need store this credential in telegram or other place?
      const fetched = localStorage.getItem(authenticationResponse.id);
      if (!fetched) {
        throw new Error("Credential not stored. Please try registering again!");
      }

      const authenticator = JSON.parse(fetched);
      console.log({ fetched });
      console.log({ authenticator });

      const publicKey = decodeFirst<any>(
        Uint8Array.from(authenticator.credentialPublicKey)
      );
      // to hex

      console.log(authenticator.credentialPublicKey);
      const kty = publicKey.get(1);
      const alg = publicKey.get(3);
      const crv = publicKey.get(-1);
      const x = publicKey.get(-2);
      const y = publicKey.get(-3);
      const n = publicKey.get(-1);
      console.log('curve', { x, y, crv, alg });

      const keyData = {
        kty: "EC",
        crv: "P-256",
        x: base64.fromArrayBuffer(x, true),
        y: base64.fromArrayBuffer(y, true),
        ext: false,
      };

      const parsedSignature = AsnParser.parse(signature, ECDSASigValue);
      let rBytes = new Uint8Array(parsedSignature.r);
      let sBytes = new Uint8Array(parsedSignature.s);

      if (shouldRemoveLeadingZero(rBytes)) {
        rBytes = rBytes.slice(1);
      }

      if (shouldRemoveLeadingZero(sBytes)) {
        sBytes = sBytes.slice(1);
      }

      // const finalSignature = isoUint8Array.concat([rBytes, sBytes]);
      const updatedSignature = concatUint8Arrays(rBytes, sBytes);

      const key = await window.crypto.subtle.importKey(
        "jwk",
        keyData,
        {
          name: "ECDSA",
          namedCurve: "P-256",
        },
        false,
        ["verify"]
      );

      const result = await window.crypto.subtle.verify(
        { hash: { name: "SHA-256" }, name: "ECDSA" },
        key,
        updatedSignature,
        preimage
      );
      console.log('result', { result, updatedSignature });

      console.log({
        r: Array.from(new Uint8Array(rBytes)).reverse(),
        s: Array.from(new Uint8Array(sBytes)).reverse(),
        pubkey_x: Array.from(new Uint8Array(x)).reverse(),
        pubkey_y: Array.from(new Uint8Array(y)).reverse(),
        msghash: Array.from(new Uint8Array(hashedMessage)).reverse(),
      })
      console.log({
        r: Array.from(new Uint8Array(rBytes)).reverse().map(x => x.toString(16)).join(''),
        s: Array.from(new Uint8Array(sBytes)).reverse().map(x => x.toString(16)).join(''),
        pubkey_x: Array.from(new Uint8Array(x)).reverse().map(x => x.toString(16)).join(''),
        pubkey_y: Array.from(new Uint8Array(y)).reverse().map(x => x.toString(16)).join(''),
        msghash: Array.from(new Uint8Array(hashedMessage)).reverse().map(x => x.toString(16)).join(''),
      })
      const a = {
        r: BigInt('0x' + Array.from(new Uint8Array(rBytes)).reverse().map(x => x.toString(16).padStart(2, '0')).join('')),
        s: BigInt('0x' + Array.from(new Uint8Array(sBytes)).reverse().map(x => x.toString(16).padStart(2, '0')).join('')),
        pubkey_x: BigInt('0x' + Array.from(new Uint8Array(x)).reverse().map(x => x.toString(16).padStart(2, '0')).join('')),
        pubkey_y: BigInt('0x' + Array.from(new Uint8Array(y)).reverse().map(x => x.toString(16).padStart(2, '0')).join('')),
        msghash: BigInt('0x' + Array.from(new Uint8Array(hashedMessage)).reverse().map(x => x.toString(16).padStart(2, '0')).join('')),
      }
      console.log('public key', compressPublicKey(a.pubkey_x, a.pubkey_y))
      console.log('signature', a.s)
      // Inputs need to be little-endian
      // const { data: proof } = await axios.post(`${API_URL}/prove_evm`, {
      //   r: Array.from(new Uint8Array(rBytes)).reverse(),
      //   s: Array.from(new Uint8Array(sBytes)).reverse(),
      //   pubkey_x: Array.from(new Uint8Array(x)).reverse(),
      //   pubkey_y: Array.from(new Uint8Array(y)).reverse(),
      //   msghash: Array.from(new Uint8Array(hashedMessage)).reverse(),
      // });
      const publickey = compressPublicKey(a.pubkey_x, a.pubkey_y)
      const txSignature = a.s
      return { hashedMessage, publickey, txSignature }

    } catch (e) {
      setError((e as any).message || "An unknown error occurred");
    }
  }

  const transferTon = async (payload: any) => {
    // TODO: Send Token to Recipient via Ton network
    console.log("Send Signature")
    console.log(payload.hashedMessage)
    console.log(payload.publickey)
    console.log(payload.txSignature)
  }

  const transfer = async () => {
    // Mock Transaction
    const transaction = new Uint8Array(111);
    transaction[0] = 42;
    const authnResult = await authenticate(transaction)
    if (authnResult) {
      await transferTon(authnResult)
    }
    window.open(miniAppUrl)
  }

  return (
    <Card>
      <FlexBoxCol>
        <h3>Transfer TON</h3>
        <FlexBoxRow>
          <label>To </label>
          <Input
            style={{ marginRight: 8 }}
            value={tonRecipient}
            onChange={(e) => setTonRecipient(e.target.value)}
          ></Input>
        </FlexBoxRow>
        <FlexBoxRow>
          <label>Amount </label>
          <Input
            style={{ marginRight: 8 }}
            type="number"
            value={tonAmount}
            onChange={(e) => setTonAmount(e.target.value)}
          ></Input>
        </FlexBoxRow>
        <Button
          style={{ marginTop: 18 }}
          onClick={transfer}
        >
          Transfer
        </Button>
      </FlexBoxCol>
    </Card>
  );
}
