import { useEffect, useState,  } from "react";
import { formatAddr } from "../utils/utils";
import { FlexBoxCol, FlexBoxRow } from "./styled/styled";

export function Wallet(prop:any) {


    return (
        <>
            <div className= "madimi-one-regular" style={{ "marginBottom": "10px", "marginTop": "60px","width": "100%", "textAlign": "center", "fontSize": "40px"}}>{Math.floor(Number(prop.balance)/10**5)/10000} Ton</div>
            <div className= "madimi-one-regular" style={{ "marginBottom": "20px", "width": "100%", "textAlign": "center", "color": "gray" }}>{formatAddr(prop.address)}</div>
            <FlexBoxCol>
                <FlexBoxRow className="px-6 justify-between madimi-one-regular" style={{"textAlign": "center"}}>
                    <div>
                        <div className="flex justify-center">
                            <button type="button" className="mb-2 text-white bg-tgblue hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:bg-tgblue dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                d="M11.0001 3.67157L13.0001 3.67157L13.0001 16.4999L16.2426 13.2574L17.6568 14.6716L12 20.3284L6.34314 14.6716L7.75735 13.2574L11.0001 16.5001L11.0001 3.67157Z"
                                fill="currentColor"
                            />
                            </svg>
                            </button>
                        </div>
                        <p className="text-xs">Receive</p>
                    </div>
                
                    <div>
                        <div className="flex justify-center">
                            <button type="button" className="mb-2 text-white bg-tgblue hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:bg-tgblue dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                d="M17.6568 8.96219L16.2393 10.3731L12.9843 7.10285L12.9706 20.7079L10.9706 20.7059L10.9843 7.13806L7.75404 10.3532L6.34314 8.93572L12.0132 3.29211L17.6568 8.96219Z"
                                fill="currentColor"
                            />
                            </svg>
                            </button>
                        </div>
                        
                        <p className="text-xs">Send</p>
                    </div>
                    <div>
                        <div className="flex justify-center">
                            <button type="button" className="mb-2 text-white bg-tgblue hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:bg-tgblue dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path
                                d="M4.99255 11.0159C4.44027 11.0159 3.99255 10.5682 3.99255 10.0159C3.99255 9.6585 4.18004 9.3449 4.46202 9.16807L7.14964 6.48045C7.54016 6.08993 8.17333 6.08993 8.56385 6.48045C8.95438 6.87098 8.95438 7.50414 8.56385 7.89467L7.44263 9.0159L14.9926 9.01589C15.5448 9.01589 15.9926 9.46361 15.9926 10.0159C15.9926 10.5682 15.5448 11.0159 14.9926 11.0159L5.042 11.0159C5.03288 11.016 5.02376 11.016 5.01464 11.0159H4.99255Z"
                                fill="currentColor"
                            />
                            <path
                                d="M19.0074 12.9841C19.5597 12.9841 20.0074 13.4318 20.0074 13.9841C20.0074 14.3415 19.82 14.6551 19.538 14.8319L16.8504 17.5195C16.4598 17.9101 15.8267 17.9101 15.4361 17.5195C15.0456 17.129 15.0456 16.4958 15.4361 16.1053L16.5574 14.9841H9.00745C8.45516 14.9841 8.00745 14.5364 8.00745 13.9841C8.00745 13.4318 8.45516 12.9841 9.00745 12.9841L18.958 12.9841C18.9671 12.984 18.9762 12.984 18.9854 12.9841H19.0074Z"
                                fill="currentColor"
                            />
                            </svg>
                            </button>
                        </div>
                        
                        <p className="text-xs">Swap</p>
                    </div>
                    <div>
                        <div className="flex justify-center">
                            <button type="button" className="mb-2 text-white bg-tgblue hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:bg-tgblue dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path d="M13 16H11V18H13V16Z" fill="currentColor" />
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M5 4C5 2.89543 5.89543 2 7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4ZM7 4H17V20H7L7 4Z"
                                fill="currentColor"
                            />
                            </svg>
                            </button>
                        </div>
                        
                        <p className="text-xs">Devices</p>
                    </div>
                </FlexBoxRow>
            </FlexBoxCol>
        </>
    )
}