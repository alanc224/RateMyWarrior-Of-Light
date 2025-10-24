import RatingScale from "../../components/RatingComponents/RatingScale/RatingScale";
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from "../../components/Header/Header";
interface RatingPageProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
}



const RatingPage = ({onLoginClick, onSignUpClick} : RatingPageProps) => {

    const [rating, setRating] = useState(0);
    // Header setup
      const navigate = useNavigate();
      const[newQuery, setNewQuery] = useState("")
    
      function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && newQuery) {
          navigate(`/results/player/${newQuery}`);
        }
      }
    return (
        <>
        <Header playerName={newQuery ?? ''}  onChange={(e) => {setNewQuery(e.target.value)}} handleKeyPress={handleKeyPress} onLoginClick={onLoginClick} onSignUpClick={onSignUpClick}/>

        <RatingScale value={rating} onChange={(newValue) => setRating(newValue ?? 0)} />
        </>
    )
}

export default RatingPage;