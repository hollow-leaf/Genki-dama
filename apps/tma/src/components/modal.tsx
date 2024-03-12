import React from "react";
import {MoonLoader} from "react-spinners"


export const Modal = (props: any) => {
  return (
    <div
      className="modal-container"
    >
      <div className="modal" style={{"maxWidth": "70%", "minHeight": "20%"}}>
        <div style={{"display": "flex", "width": "100%", "justifyContent": "center", "fontSize": "30px"}}><p className="madimi-one-regular">{props.message}</p></div>
        <div style={{"display": "flex", "width": "100%", "justifyContent": "center", "marginTop": "20px"}}>
            <MoonLoader
            color="#2eaddc"
            loading
            size={90}
            speedMultiplier={1}
            />
        </div>
        <div className="modal-footer" style={{"marginTop": "50px"}}>
          <button
            type="submit"
            className="sc-fqkvVR kxTNJI"
            onClick={() => props.closeModal()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};