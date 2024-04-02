import  { Network, Tonfura } from "tonfura-sdk";
import { AuthenWallet } from "./ton/tonService";

//Tonfura api call
const  TONFURA_KEY  = "fd3d7559-c4c2-4cab-8131-d46a95d77f76";
const tonfura = new Tonfura({
    apiKey: TONFURA_KEY,
    network: Network.Testnet,
});

export async function getBalanceByAddr(addr: string) {
    try {
        const addressBalance = await tonfura.core.getAddressBalance(addr);
        console.log(addressBalance)
        return addressBalance.data.result
    } catch(e) {
        console.log(e)
        return 0
    }
}

//serverless call
const  headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}

const HOST = "https://authenwallet.wayneies1206.workers.dev"

export async function getAddressBytelegramId(telegramId:number) {
    try {
        let body = {
            "telegramId": telegramId
        }
        const res = await fetch(HOST + '/userInfo', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res.json()
            return {publicKey: rres.publicKey, contractAddress: rres.contractAddress, authenId: rres.authenId}
        }else{
            return {publicKey: "", contractAddress: "", authenId: ""}
        }
    }
    catch (err) {
        console.log("error", err);
        return {publicKey: "", contractAddress: "", authenId: ""}
    }
}

export async function deleteBytelegramId(telegramId:number) {
    try {
        let body = {
            "telegramId": telegramId,
        }
        const res = await fetch(HOST + '/cleanUserInfo', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
    }
    catch (err) {
        console.log("error", err);
    }
}

export async function updateAddressBytelegramId(telegramId:string, publicKey:string, contractAddress:string,  authenId:string) {
    try {
        let body = {
            "telegramId": telegramId,
            "publicKey": publicKey,
            "contractAddress": contractAddress,
            "authenId": authenId
        }
        const res = await fetch(HOST + '/updateUserInfo', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res
            return true
        }else{
            return false
        }
    }
    catch (err) {
        console.log("error", err);
        return false
    }
}

export async function getTxResult(hashedTxDataLabel: string) {
    try {
        let body = {
            "hashedTxDataLabel": hashedTxDataLabel
        }
        const res = await fetch(HOST + '/txResult', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res.json()
            return {result: rres.result}
        }else{
            return {result: "failed"}
        }
    }
    catch (err) {
        console.log("error", err);
        return {result: "failed"}
    }
}

export async function updateTxResult(hashedTxDataLabel: string) {
    try {
        let body = {
            "hashedTxDataLabel": hashedTxDataLabel,
            "result" : "success"
        }
        const res = await fetch(HOST + '/updateTxResult', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
    }
    catch (err) {
        console.log("error", err);
    }
}

export async function getWalletAddressPublicKey(publicKey: string) {
    try {
        let body = {
            "publicKey": publicKey
        }
        const res = await fetch(HOST + '/walletAddressByPubicKey', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            const rres = await res.json()
            return {publicKey: rres.publicKey, contractAddress: rres.contractAddress}
        }else{
            return {publicKey: "", contractAddress: ""}
        }
    }
    catch (err) {
        console.log("error", err);
        //for testing
        return {publicKey: "", contractAddress: ""}
    }
}

export async function updateWalletAddressPublicKey(publicKey: string, contractAddress: string) {
    try {
        let body = {
            "publicKey": publicKey,
            "contractAddress": contractAddress
        }
        const res = await fetch(HOST + '/updateWalletAddressByPubicKey', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
          })
        if(res){
            return true
        }else{
            return false
        }
    }
    catch (err) {
        console.log("error", err);
        //for testing
        return false
    }
}

export async function createNewMainWallet(publicKey: string):Promise<string> {
    const ra = Math.floor(Math.random() * 1000000)
    const aut = new AuthenWallet(0, publicKey, ra)

    const successful = await updateWalletAddressPublicKey(publicKey, aut.address.toString())    

    if(successful) {
        return aut.address.toString()
    }else {
        return ""
    }
}