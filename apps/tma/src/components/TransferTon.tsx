import { useEffect, useState } from "react";
import styled from "styled-components";
import { SendMode } from "@ton/core";
import { useTonConnect } from "../hooks/useTonConnect";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { useSearchParams } from "react-router-dom";
import { decodeFirst, concatUint8Arrays, parseAuthenticatorData, shouldRemoveLeadingZero, signMessage } from "../utils/authHelper"
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
import { AuthenWallet } from "../services/ton/tonService";

export function TransferTon() {
  const [error, setError] = useState("");
  const [miniAppUrl, setMiniAppUrl] = useState("");
  const [miniAppToken, setMiniAppToken] = useState("");
  const [tonAmount, setTonAmount] = useState("");
  const [tonRecipient, setTonRecipient] = useState("");
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [publicKey, setPublicKey] = useState("");
  const [authenId, setAuthenId] = useState<string>("");

  useEffect(() => {
    let search = window.location.search;
    let searchData = new URLSearchParams(search).get('_data_') || 'query';
    let queryParameter = new URLSearchParams(searchData)
    setMiniAppUrl(queryParameter.get('miniAppURL') || "")
    setMiniAppToken(queryParameter.get('miniAppToken') || "")
    setTonRecipient(queryParameter.get('recipient') || "")
    setTonAmount(queryParameter.get('amount') || "")
    setPublicKey(queryParameter.get('publicKey') || "")
    setAuthenId(queryParameter.get('authenId') || "")
  }, [])

  function compressPublicKey(pubKeyX: any, pubKeyY: any) {
    const yBit = pubKeyY % 2n === 0n ? 0x02 : 0x03;
    const compressedPubKey = [yBit].concat(pubKeyX);
    return compressedPubKey.map(x => x.toString(16).padStart(2, '0')).join('');
  }

  // webauthn authenticate
  const transferTon = async (payload: any) => {
    // TODO: Send Token to Recipient via Ton network
    console.log("Send Signature")
    console.log(payload.hashedMessage)
    console.log(payload.publickey)
    console.log(payload.txSignature)
  }

  const transfer = async () => {
    // Mock Transaction
    const authenWallet = new AuthenWallet(0, publicKey, 9453);
    const internalMessage = authenWallet.createTransferInternalMessage(Number(tonAmount), tonRecipient);
    const unsignedMessage = authenWallet.createUnsignedMessage({sendMode:SendMode.PAY_GAS_SEPARATELY, seqno:0, messages: [internalMessage]})
    const transaction = new Uint8Array(111);
    transaction[0] = 42;
    const authenResult = await signMessage(transaction, authenId)
    if(authenResult != "") {
      console.log(authenResult.Signature.length)
    }
    //window.open(miniAppUrl)
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
