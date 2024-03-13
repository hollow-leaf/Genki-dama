import { useEffect, useState } from "react";
import { SendMode, beginCell } from "@ton/core";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { AuthenWallet } from "../services/ton/tonService";
import { signMessage } from "../utils/authHelper";
import { createPortal } from "react-dom";
import { Modal } from "./modal";
import { updateTxResult } from "../services/api";

export function TransferTon() {
  const [hashedTxDataLabel, setHashedTxDataLabel] = useState("");
  const [miniAppUrl, setMiniAppUrl] = useState("");
  const [miniAppToken, setMiniAppToken] = useState("");
  const [tonAmount, setTonAmount] = useState("");
  const [tonRecipient, setTonRecipient] = useState("");
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [publicKey, setPublicKey] = useState("");
  const [authenId, setAuthenId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);


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
    setHashedTxDataLabel(queryParameter.get('hashedTxDataLabel') || "")
  }, [])

  const closeModal = () => {setLoading(false)}

  const transfer = async () => {
    // Mock Transaction
    const authenWallet = new AuthenWallet(0, publicKey, 9453);
    const internalMessage = authenWallet.createTransferInternalMessage(Number(tonAmount), tonRecipient);
    const unsignedMessage = authenWallet.createUnsignedMessage({sendMode:SendMode.PAY_GAS_SEPARATELY, seqno:0, messages: [internalMessage]})
    let utf8Encode = new TextEncoder();
    const transaction = new Uint8Array(111);
    transaction[0] = 42;
    const authenResult = await signMessage(utf8Encode.encode(unsignedMessage.bits.toString()), authenId)
    setLoading(true)
    if(authenResult != "") {
      const signedBody= beginCell()
      .storeUint(BigInt('0x' + Array.from(authenResult.Signature).map(x => x.toString(16).padStart(2, '0')).join('').substring(0, 64)), 256)
      .storeUint(BigInt('0x' + Array.from(authenResult.Signature).map(x => x.toString(16).padStart(2, '0')).join('').substring(64, 128)), 256)
      .storeBuilder(unsignedMessage.asBuilder())
      .endCell()
      await authenWallet.send2back(signedBody)
      await updateTxResult(hashedTxDataLabel)
      setLoading(false)
    } else {
      setLoading(false)
      alert("Signed failed")
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
      {loading&&createPortal(<Modal closeModal= {closeModal} message= {"Loading"} />, document.body)}
    </Card>
  );
}
