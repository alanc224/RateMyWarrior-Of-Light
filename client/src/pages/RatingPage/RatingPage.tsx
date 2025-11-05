import RatingScale from "../../components/RatingComponents/RatingScale/RatingScale";
import RatingYesNo from "../../components/RatingComponents/RatingYesNo/RatingYesNo";
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from "../../components/Header/Header";
import "./RatingPage.css"
interface RatingPageProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
}



const RatingPage = ({onLoginClick, onSignUpClick} : RatingPageProps) => {

    const [rating, setRating] = useState(0);
    const [yesNo1, setYesNo1] = useState<"" | "yes" | "no">("");
    const [yesNo2, setYesNo2] = useState<"" | "yes" | "no">("");
    const [review, setReview] = useState("")
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state

    const[newQuery, setNewQuery] = useState("")
  
    function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.key === 'Enter' && newQuery) {
        navigate(`/results/player/${newQuery}`);
      }
    }
    return (
        <>
        
          <Header playerName={newQuery ?? ''}  onChange={(e) => {setNewQuery(e.target.value)}} handleKeyPress={handleKeyPress} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick}/>
          <div className='rating-page-container'>
            <p className='rating-name'>{state.name}</p>
            <p className='rating-add-rating'>Add Rating</p>
            <div className='rating-elements'>
              <RatingScale value={rating} onChange={(newValue) => setRating(newValue ?? 0)} />
              <RatingYesNo question="Would you play this with player again?" value={yesNo1} onChange={(newValue) => setYesNo1(newValue)}/>
              <RatingYesNo question="Would you recommend others to play with this player?" value={yesNo2} onChange={(newValue) => setYesNo2(newValue)}/>

              <div className='rating-component'>
                <div className='rating-question'>
                  <p className='rating-subtitle'>Write a Review</p>
                </div>
                <div className='rating-text-review-container'>
                  <form>
                    <label>
                      <textarea
                        className='rating-text-review'
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="What do you want to let other players know about this player?"
                      />
                    </label>
                  </form>

                </div>
              </div>
              <div className="rating-component" > 
                <button className='rating-submit-btn'>Submit Rating</button>
              </div>
            </div>
          </div>
        </>
    )
}

export default RatingPage;