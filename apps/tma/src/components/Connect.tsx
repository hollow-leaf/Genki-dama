import { Modal } from 'flowbite';
import type { ModalOptions, ModalInterface } from 'flowbite';
import type { InstanceOptions } from 'flowbite';
import { FlexBoxRow } from './styled/styled';

export function connectModal() {
    const $modalElement: any = document.querySelector('#connectModal');

    const modalOptions: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
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
    id: 'connectModal',
    override: true
    };

    const modal: ModalInterface = new Modal($modalElement, modalOptions, instanceOptions);

    modal.show();
}

export function cancel() {
    const $modalElement: any = document.querySelector('#connectModal');

    const modalOptions: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
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
    id: 'connectModal',
    override: true
    };

    const modal: ModalInterface = new Modal($modalElement, modalOptions, instanceOptions);

    modal.hide();
}

export function Connect(prop:any) {
    const $modalElement: any = document.querySelector('#connectModal');

    const modalOptions: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
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
    id: 'connectModal',
    override: true
    };

    const modal: ModalInterface = new Modal($modalElement, modalOptions, instanceOptions);

    return (
        <div>
            <div id="connectModal" aria-hidden="true" className="overflow-y-auto overflow-x-hidden fixed top-50 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
                <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                            <h3 className="w-full text-center text-xl font-semibold text-gray-900 dark:text-white">
                                Wallet Connect
                            </h3>
                        </div>
                        <div className="p-4 md:p-5">
                            <FlexBoxRow>
                                <button type="submit" onClick={prop.connecthandler} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Connect</button>
                                <button type="submit" onClick={()=>{cancel()}} className="w-full opacity-80 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Cancel</button>
                            </FlexBoxRow>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    )
}