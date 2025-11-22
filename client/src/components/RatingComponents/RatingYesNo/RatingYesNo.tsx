// import { useState } from "react"; leave commented out until used
import Checkmark from "../../../assets/rate/checkmark.png";
import Xmark from "../../../assets/rate/xmark.png";
import "./RatingYesNo.css"
interface RatingYesNoProps {
  question: string;
  value: "yes" | "no" | "";
  onChange: (newValue: "yes" | "no") => void;
}
const RatingYesNo = ({ question, value, onChange}: RatingYesNoProps) => {

  return (
    <div className="rating-component">
      <div className='rating-question'>
        <p className='rating-subtitle'>{question}</p>
      </div>
      {/* <p>value is {value}</p> */}
      <div className="image-radios">

          <div
            key="yes"
            className={`image-radio ${value === "yes" ? "selected" : ""}`}
            onClick={() => onChange("yes")}
            style={{ backgroundImage: `url(${Checkmark})` }}
            role="button"
            tabIndex={0}
          />
          <div
            key="no"
            className={`image-radio ${value === "no" ? "selected" : ""}`}
            onClick={() => onChange("no")}
            style={{ backgroundImage: `url(${Xmark})` }}
            role="button"
            tabIndex={0}
          />
        
      </div>
    </div>
  );
};

export default RatingYesNo;
