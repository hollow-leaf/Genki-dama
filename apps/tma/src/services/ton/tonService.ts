import { Address, beginCell, SendMode, Cell, external, contractAddress, ContractProvider, internal, MessageRelaxed, storeMessageRelaxed, storeMessage } from '@ton/core';
import { Network, Tonfura } from "tonfura-sdk"

const TONFURA_KEY = "fd3d7559-c4c2-4cab-8131-d46a95d77f76";

const tonfura = new Tonfura({
    apiKey: TONFURA_KEY,
    network: Network.Testnet,
  });

export type AuthenWalletConfig = {
    workchain: number
    publicKey: string
    walletId: number
    code: Cell
};

export class AuthenWallet {
    workchain: number;
    publicKey: string;
    walletId: number;
    init?: { code: Cell; data: Cell }
    address: Address

    static create(args: AuthenWalletConfig) {
        return new AuthenWallet(args.workchain, args.publicKey, args.walletId);
    }
    constructor(workchain: number, publicKey: string, walletId: number) {
        // Resolve parameters
        this.workchain = workchain;
        this.publicKey = publicKey;
        if (walletId !== null && walletId !== undefined) {
            this.walletId = walletId;
        }
        else {
            this.walletId = 698983191 + workchain;
        }
        // Build initial code and data
        let code = Cell.fromBoc(Buffer.from("te6ccgEBBAEAagABFP8A9KQT9LzyyAsBAgFiAgMAltBsMSDXScEg8mPtRNAB1AHQ0/8wAdQB0IEBCNcYMAHUAdDW/zAB1AHQ1v8wyFADzxZYzxbJ0EMD+RTyotMfMAHTPzABoMjLP8ntVAARoen72omhpn5h", "base64"))[0];
        let data = beginCell()
            .storeUint(0, 32) // Seqno
            .storeUint(this.walletId, 32)
            .storeUint(BigInt('0x'+this.publicKey.substring(0,2)), 8)
            .storeUint(BigInt('0x'+this.publicKey.substring(2,66)), 256)
            .storeBit(0) // Empty plugins dict
            .endCell();
        this.init = { code, data };
        this.address = contractAddress(workchain, { code, data });
    }
    /**
     * Get Wallet Balance
     */
    async getBalance(provider: ContractProvider) {
        let state = await provider.getState();
        return state.balance;
    }
    /**
     * Get Wallet Seqno
     */
    async getSeqno(provider: ContractProvider) {
        let state = await provider.getState();
        if (state.state.type === 'active') {
            let res = await provider.get('seqno', []);
            return res.stack.readNumber();
        }
        else {
            return 0;
        }
    }

    async getBindingMainWallet(provider: ContractProvider) {
        let state = await provider.getState();

        //TODO: Editing value parsing
        /* if (state.state.type === 'active') {
            let res = await provider.get('BindingMainWallet', []);
            return res.stack.readNumber();
        }
        else {
            return 0;
        } */

        //Only for testing
        return ""
    }

    createTransferInternalMessage(value: number, to: string) {
        return internal(
            {
                value: BigInt(value),
                to: to,
                body: beginCell().endCell(),
            }
        )
    }

    createUnsignedMessage(args: { seqno: any; sendMode: any; messages: MessageRelaxed[]; }) {
        var resCell = beginCell()
        .storeUint(this.walletId, 32)

        if (args.seqno === 0) {
            for (let i = 0; i < 32; i++) {
                resCell.storeBit(1);
            }
        }
        else {
            resCell.storeUint(Math.floor(Date.now() / 1e3) + 180, 32); // Default timeout: 60 seconds
        }
        resCell.storeUint(args.seqno, 32)
        .storeUint(0, 8)

        for (let m of args.messages) {
            resCell.storeUint(args.sendMode, 8);
            resCell.storeRef(beginCell().store(storeMessageRelaxed(m)));
        }

        return resCell.endCell()
    }

    async send2back(signedMessage: Cell) {
        const externalMessage = external({
            to: this.address,
            init: null,
            body: signedMessage,
        });

        const boc = beginCell()
        .store(storeMessage(externalMessage))
        .endCell()
        .toBoc();

        try {
            await tonfura.transact.sendBoc(boc.toString("base64"));
        } catch(e) {
            console.log(e)
        }
    }
}

