// Send Tx to TON without serverless api
// url -> message
// webauthn(message) -> sign
// sign + message -> Ton 
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Address, toNano } from "ton";
import { useTonConnect } from "../hooks/useTonConnect";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { useSearchParams } from "react-router-dom";

export function TransferTon() {
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

  const transferTon = () => {
    // TODO: Send Token to Recipient via Ton network
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
          onClick={transferTon}
        >
          Transfer
        </Button>
      </FlexBoxCol>
    </Card>
  );
}
