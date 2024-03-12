import { useState } from "react";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { decodeFirst, concatUint8Arrays, parseAuthenticatorData, shouldRemoveLeadingZero } from "../utils/authHelper"
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnParser } from "@peculiar/asn1-schema";
import base64 from "@hexagon/base64";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  VerifiedRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { cp } from "fs";

export function Login() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState<VerifiedRegistrationResponse>();
  function compressPublicKey(pubKeyX: any, pubKeyY: any) {
    const yBit = pubKeyY % 2n === 0n ? 0x02 : 0x03;
    const compressedPubKey = [yBit].concat(pubKeyX);
    return compressedPubKey.map(x => x.toString(16).padStart(2, '0')).join('');
  }
  // webauthn registration
  async function createNewCredential() {
    try {
      const generatedRegistrationOptions = await generateRegistrationOptions({
        rpName: "demo",
        rpID: window.location.hostname,
        userID: username || "Based Account",
        userName: username || "Based Account",
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
      setResponse(verificationResponse);
      if (!verificationResponse.registrationInfo) {
        return;
      }
      const { id } = startRegistrationResponse;
      const { credentialID, credentialPublicKey, counter } =
        verificationResponse.registrationInfo;
      console.log(id)

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
      localStorage.setItem("user-registered", "true");
    } catch (e) {
      setError((e as any).message || "An unknown error occured");
    }
  }

  async function authenticate(unsignData: string) {
    setError("");
    try {
      const authenticationOptions = await generateAuthenticationOptions({
        rpID: window.location.hostname,
        challenge: unsignData,  
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

      const response = await verifyAuthenticationResponse({
        response: authenticationResponse,
        expectedChallenge: "YXNkZg",
        expectedOrigin: window.location.origin,
        expectedRPID: window.location.hostname,
        authenticator: {
          credentialID: Uint8Array.from(authenticator.credentialID),
          credentialPublicKey: Uint8Array.from(
            authenticator.credentialPublicKey
          ),
          counter: authenticator.counter,
        },
      });
      console.log({ response });
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
        msghash: BigInt('0x' + Array.from(new Uint8Array(hashedMessage)).map(x => x.toString(16).padStart(2, '0')).join('')),
      }

      const pk = compressPublicKey(a.pubkey_x, a.pubkey_y)

      return {a, pk}

    } catch (e) {
      setError((e as any).message || "An unknown error occurred");
    }
  }
  return (
    <Card>
      <FlexBoxCol>
        <h3>Register Account</h3>
        <FlexBoxRow>
          <Input
            style={{ marginRight: 8 }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          ></Input>
          <Button onClick={createNewCredential}>
            Register new account
          </Button>
        </FlexBoxRow>
        <FlexBoxRow>
          <Button onClick={() => authenticate("your_unsign_data_here")}>
            authenticate
          </Button>
        </FlexBoxRow>
      </FlexBoxCol>
    </Card>
  );
}
