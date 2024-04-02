import { useEffect, useState } from "react";
import { SendMode, beginCell, Address } from "@ton/core";
import { Card, FlexBoxCol, FlexBoxRow, Button, Input } from "./styled/styled";
import { AuthenWallet } from "../services/ton/tonService";
import { signMessage } from "../utils/authHelper";
import { createPortal } from "react-dom";
import { Modall } from "./modal";
import { updateTxResult } from "../services/api";
import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';
import Loading from "./loading";

export function OpenTransferModal() {
    const $modalElement: any = document.querySelector('#transfermodal');

    const modalOptions: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
        closable: true,
        onHide: () => {
            console.log('modal is hidden');
        },
        onShow: () => {
            console.log('modal is shown');
        },
        onToggle: () => {
            console.log('modal has been toggled');
        },
    };

    // instance options object
    const instanceOptions: InstanceOptions = {
    id: 'modalEl',
    override: true
    };

    const modal: ModalInterface = new Modal($modalElement, modalOptions, instanceOptions);

    modal.show();
}


export function CloseTransferModal() {
    const $modalElement: any = document.querySelector('#transfermodal');

    const modalOptions: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
        closable: true,
        onHide: () => {
            console.log('modal is hidden');
        },
        onShow: () => {
            console.log('modal is shown');
        },
        onToggle: () => {
            console.log('modal has been toggled');
        },
    };

    // instance options object
    const instanceOptions: InstanceOptions = {
    id: 'modalEl',
    override: true
    };

    const modal: ModalInterface = new Modal($modalElement, modalOptions, instanceOptions);

    modal.hide();
}

export function Transfer(props:any) {
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
    //using telegram app
    if(queryParameter.get('miniAppURL') != null) {
        setMiniAppUrl(queryParameter.get('miniAppURL') || "")
        setMiniAppToken(queryParameter.get('miniAppToken') || "")
        setTonRecipient(queryParameter.get('recipient') || "")
        setTonAmount(queryParameter.get('amount') || "")
        setPublicKey(queryParameter.get('publicKey') || "")
        setAuthenId(queryParameter.get('authenId') || "")
        setHashedTxDataLabel(queryParameter.get('hashedTxDataLabel') || "")
        if(tonRecipient!="") {
            props.OpenTransferModal()
        }

    }else {
        //using web
        setPublicKey(props.publicKey || "")
        setAuthenId(props.authenId || "")
    }
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
    const authenResult = await signMessage(unsignedMessage.hash(), authenId)
    setLoading(true)
    if(authenResult != "" && authenResult != undefined) {
      const signedBody= beginCell()
      .storeUint(BigInt('0x' + Array.from(authenResult.Signature).map(x => x.toString(16).padStart(2, '0')).join('').substring(0, 64)), 256)
      .storeUint(BigInt('0x' + Array.from(authenResult.Signature).map(x => x.toString(16).padStart(2, '0')).join('').substring(64, 128)), 256)
      .storeBuilder(unsignedMessage.asBuilder())
      .endCell()
      await authenWallet.send2back(signedBody)
      if(hashedTxDataLabel!="") {
        await updateTxResult(hashedTxDataLabel)
      }
      setLoading(false)
      CloseTransferModal()
      if(miniAppUrl!="") {
        window.location.href = (miniAppUrl)
      } else {
        alert("Message send!")
      }
    } else {
      setLoading(false)
      alert("Signed failed")
    }
  }

  return (
        <div id="transfermodal" aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed bottom-0 right-0 left-0 z-40 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl w-full text-center font-semibold text-gray-900 dark:text-white">
                            Transfer Ton
                        </h3>
                    </div>
                    {!loading?<div className="p-4 md:p-5">
                        <form className="space-y-4" action="#">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Recipient</label>
                                <input onChange={(e) => setTonRecipient(e.target.value)} value={tonRecipient} id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount</label>
                                <input onChange={(e) => setTonAmount(e.target.value)} value={tonAmount} id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                            </div>
                            <FlexBoxRow>
                            <button type='button' onClick={transfer} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Transfer</button>
                            <button type='button' onClick={()=>{CloseTransferModal()}} className="w-full p opacity-70 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                            </FlexBoxRow>
                        </form>
                    </div>:
                    <div className="flex items-center justify-center w-100 h-56 border border-gray-200 rounded-b-lg bg-gray-700 dark:bg-gray-700 dark:border-gray-700">
                        <div role="status">
                            <svg aria-hidden="true" className="w-20 h-20 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                        </div>
                    </div>}
                    {!loading?<></>:
                        <button type='button' onClick={()=>{CloseTransferModal()}} className="my-5 w-10/12 p opacity-40 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                    }
                </div>
            </div>
            {loading&&createPortal(<Modall className="z-50" closeModal= {closeModal} message= {"Loading"} />, document.body)}
        </div> 
  );
}
