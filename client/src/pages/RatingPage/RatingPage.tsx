import RatingScale from "../../components/RatingComponents/RatingScale/RatingScale";
import RatingYesNo from "../../components/RatingComponents/RatingYesNo/RatingYesNo";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from "../../components/Header/Header"; // No need to pass props anymore
import "./RatingPage.css";
import { useAuth, useClerk } from '@clerk/clerk-react'


const RatingPage = () => {
    const [rating, setRating] = useState(0);
    const [yesNo1, setYesNo1] = useState<"" | "yes" | "no">("");
    const [yesNo2, setYesNo2] = useState<"" | "yes" | "no">("");
    const [review, setReview] = useState("");
    const [contentType, setContentType] = useState("Dungeon");
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state;
    const { isSignedIn, getToken } = useAuth();
    const { openSignIn } = useClerk();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmitReview = async () => {
        if (!isSignedIn) {
            setError('You must be logged in to submit a rating.');
            openSignIn(); 
            return;
        }

        if (!rating || !review) {
            setError('Please provide both a rating and a review.');
            return;
        }

        if (!yesNo1 || !yesNo2) {
        setError('Please answer both "Play Again" and "Recommend" questions.');
        return;
    }

        setLoading(true);
        setError(null); // Reset error

        const reviewData = {
            characterId: String(state.id),
            characterName: state.name, 
            server: state.server,            
            rating: Number(rating),
            reviewText: review,
            playAgain: yesNo1 === 'yes',
            recommend: yesNo2 === 'yes',
            contentType: contentType,
    };

        try {
            const token = await getToken();
            const response = await fetch(/*'http://localhost:5001/api/reviews'*/ 'https://ratemywarrioroflight-api.onrender.com/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData),
                // credentials: 'include',
            });

            if (response.status === 409) {
                setError('You already left a review for this player.');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to submit review');
            }

            navigate(`/detailpage/${state.id}`, {
                state: {
                    id: state.id,
                    name: state.name,
                    portrait: state.portrait,
                    server: state.server,
                    world: state.world,
                }
            });

        } catch (error) {
            setError('Failed to submit the review. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header  />
            <div className='rating-page-container'>
                <p className='rating-name'>{state.name}</p>
                <p className='rating-add-rating'>Add Rating</p>
                <div className='rating-elements'>
                    <RatingScale value={rating} onChange={(newValue) => setRating(newValue ?? 0)} />
                    <RatingYesNo question="Would you play this with player again?" value={yesNo1} onChange={(newValue) => setYesNo1(newValue)} />
                    <RatingYesNo question="Would you recommend others to play with this player?" value={yesNo2} onChange={(newValue) => setYesNo2(newValue)} />

                    <div className='rating-component'>
                        <div className='rating-question'>
                            <p className='rating-subtitle'>Content Type</p>
                        </div>
                        <div className='rating-dropdown-container'>
                            <select 
                                value={contentType} 
                                onChange={(e) => setContentType(e.target.value)}
                                className="rating-select"
                            >
                                <option value="Dungeon">Dungeon</option>
                                <option value="Trial">Trial</option>
                                <option value="Raid">Raid</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className='rating-component'>
                        <div className='rating-question'>
                            <p className='rating-subtitle'>Write a Review</p>
                        </div>
                        <div className='rating-text-review-container'>
                            <textarea
                                className='rating-text-review'
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="What do you want to let other players know about this player?"
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '15px' }}>
                            {error}
                        </div>
                    )}
                    <div className="rating-component">
                        <button className='rating-submit-btn' onClick={handleSubmitReview} disabled={loading}> {loading ? 'Submitting...' : 'Submit Rating'}</button>
                    </div>
                </div>
            </div>
        </>
    )
};

export default RatingPage;
