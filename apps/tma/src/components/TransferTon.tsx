import { useEffect, useState } from "react";
import { SendMode, beginCell, Address } from "@ton/core";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { AuthenWallet } from "../services/ton/tonService";
import { signMessage } from "../utils/authHelper";
import { createPortal } from "react-dom";
import { Modall } from "./modal";
import { updateTxResult } from "../services/api";

export function TransferTon() {
  const [hashedTxDataLabel, setHashedTxDataLabel] = useState("");
  const [miniAppUrl, setMiniAppUrl] = useState("");
  const [miniAppToken, setMiniAppToken] = useState("");
  const [tonAmount, setTonAmount] = useState("");
  const [tonRecipient, setTonRecipient] = useState("");
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
    try {
      const testAddr = Address.parse(tonRecipient)
    } catch(e) {
      console.log(e)
      alert("Error Recipient Address")
      return
    }
    console.log(tonAmount)
    // Mock Transaction
    const authenWallet = new AuthenWallet(0, publicKey, 9453);
    const internalMessage = authenWallet.createTransferInternalMessage(Number(tonAmount), tonRecipient);
    const unsignedMessage = authenWallet.createUnsignedMessage({sendMode:SendMode.PAY_GAS_SEPARATELY, seqno:0, messages: [internalMessage]})
    let utf8Encode = new TextEncoder();
    const transaction = new Uint8Array(111);
    transaction[0] = 42;
    const authenResult = await signMessage(utf8Encode.encode(unsignedMessage.bits.toString()), authenId)
    setLoading(true)
    if(authenResult != "" && authenResult != undefined) {
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
    window.location.href = (miniAppUrl)
  }

  return (
    <Card>
      <FlexBoxCol>
        <h3 style={{ "marginBottom": "10px", "marginTop": "30px","width": "100%", "textAlign": "center", "fontSize": "40px"}}>Transfer TON</h3>
        <FlexBoxRow>
          <label style={{ "marginRight": "8",  "marginBottom": "5px", "marginTop": "60px", "textAlign": "center", "fontSize": "20px" }}>To </label>
          <Input
            style={{ "marginRight": "8",  "marginBottom": "5px", "marginTop": "60px","width": "100%", "textAlign": "center", "fontSize": "15px" }}
            value={tonRecipient}
            onChange={(e) => setTonRecipient(e.target.value)}
          ></Input>
        </FlexBoxRow>
        <FlexBoxRow>
          <label style={{ "marginRight": "8",  "marginBottom": "10px", "marginTop": "20px", "textAlign": "center", "fontSize": "20px" }}>Amount </label>
          <Input
            style={{ "marginRight": "8",  "marginBottom": "10px", "marginTop": "20px","width": "80%", "textAlign": "center", "fontSize": "15px" }}
            type="number"
            value={tonAmount}
            onChange={(e) => setTonAmount(e.target.value)}
          ></Input>
        </FlexBoxRow>
        <Button
          style={{ marginTop: 18 }}
          onClick={transfer}
        >
          Sign Transaction
        </Button>
      </FlexBoxCol>
      {loading&&createPortal(<Modall closeModal= {closeModal} message= {"Loading"} />, document.body)}
    </Card>
  );
}
