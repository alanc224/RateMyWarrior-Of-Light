import RatingScale from "../../components/RatingComponents/RatingScale/RatingScale";
import RatingYesNo from "../../components/RatingComponents/RatingYesNo/RatingYesNo";
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Header from "../../components/Header/Header"; 
import "./RatingPage.css";
import { useAuth, useClerk } from '@clerk/clerk-react';

interface CharacterDetails {
    id: string;
    name: string;
    server: string;
    portrait?: string;
    world?: string;
}

const RatingPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isSignedIn, getToken } = useAuth();
    const { openSignIn } = useClerk();


    const passedCharacter = location.state?.character || location.state;
    const editReviewData = location.state?.editReviewData || null;
    const isEditing = !!editReviewData;

    const [character, setCharacter] = useState<CharacterDetails | null>(() => {
        if (passedCharacter) {
            return {
                id: String(passedCharacter.id || id),
                name: passedCharacter.name || passedCharacter.characterName || passedCharacter.character_name || "",
                server: passedCharacter.server || passedCharacter.serverName || passedCharacter.world || "",
                portrait: passedCharacter.portrait || "",
                world: passedCharacter.world || ""
            };
        }
        return null;
    });

    const [rating, setRating] = useState(editReviewData ? editReviewData.rating : 0);
    const [yesNo1, setYesNo1] = useState<"" | "yes" | "no">( editReviewData ? (editReviewData.playAgain ? "yes" : "no") : "");
    const [yesNo2, setYesNo2] = useState<"" | "yes" | "no">( editReviewData ? (editReviewData.recommend ? "yes" : "no") : "");
    const [review, setReview] = useState(editReviewData ? editReviewData.comment : "");
    const [contentType, setContentType] = useState(editReviewData ? editReviewData.contentType : "Dungeon");
    const [pageLoading, setPageLoading] = useState(!character); 
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (character) {
            setPageLoading(false);
            return;
        }

        const fetchCharacterDetails = async () => {
            if (!id) {
                setError("No valid character ID found in the URL path.");
                setPageLoading(false);
                return;
            }
            try {
                setPageLoading(true);
                const response = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/players/${id}`);
                
                if (!response.ok) {
                    throw new Error("Could not look up character data for this URL.");
                }
                
                const data = await response.json();
                
                setCharacter({
                    id: String(data.id || data.character_id || id),
                    name: data.name || data.characterName || data.character_name || "Unknown Character",
                    server: data.server || data.serverName || data.world || "Unknown Server",
                    portrait: data.portrait || "",
                    world: data.world || data.server || ""
                });
            } catch (err: any) {
                console.error("Error matching direct link character access:", err);
                setError(err.message || "Failed to load character information.");
            } finally {
                setPageLoading(false);
            }
        };

        fetchCharacterDetails();
    }, [id, character]);

    const handleSubmitReview = async () => {
        if (!isSignedIn) {
            setError('You must be logged in to submit a rating.');
            openSignIn(); 
            return;
        }

        if (!character) {
            setError('Cannot submit review: Character identity details are missing.');
            return;
        }

        if (!rating || !review.trim()) {
            setError('Please provide both a rating and a review.');
            return;
        }

        if (!yesNo1 || !yesNo2) {
            setError('Please answer both "Play Again" and "Recommend" questions.');
            return;
        }

        setSubmitLoading(true);
        setError(null); 

        const reviewData = {
            characterId: String(character.id),
            characterName: character.name, 
            server: character.server,            
            rating: Number(rating),
            reviewText: review,
            playAgain: yesNo1 === 'yes',
            recommend: yesNo2 === 'yes',
            contentType: contentType,
        };


        try {
            const token = await getToken();

            const targetUrl = isEditing 
                ? `https://ratemywarrioroflight-api.onrender.com/api/reviews/${editReviewData.id}`
                : 'https://ratemywarrioroflight-api.onrender.com/api/reviews';
                
            const targetMethod = isEditing ? 'PUT' : 'POST';

            const response = await fetch(targetUrl, {
                method: targetMethod,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(reviewData),
            });

            const data = await response.json();

            if (!isEditing && response.status === 409) {
                setError('You already left a review for this player.');
                return;
            }

            if (response.status === 409) {
                setError('You already left a review for this player.');
                return;
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit review');
            }

            navigate(`/detailpage/${character.id}`, {
                state: character
            });

        } catch (error: any) {
            setError(error.message || 'Failed to submit the review. Please try again later.');
        } finally {
            setSubmitLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <>
                <Header />
                <div className='rating-page-container' style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>Loading character identity profile...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className='rating-page-container'>
                <p className='rating-name'>{isEditing ? `Editing Review for ${character?.name}` : character?.name || "Unknown Character"}</p>
                <p className='rating-add-rating'>Player in the {character?.server || "Unknown Server"} server</p>
                <div className='rating-elements'>
                    <RatingScale value={rating} onChange={(newValue) => setRating(newValue ?? 0)} />
                    <RatingYesNo question="Would you play with this player again?" value={yesNo1} onChange={(newValue) => setYesNo1(newValue)} />
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
                                maxLength={350}
                                placeholder="What do you want to let other players know about this player?"
                            />
                        <div style={{ 
                                textAlign: 'right', 
                                fontSize: '0.85rem', 
                                color: review.length >= 350 ? 'red' : '#666',
                                marginTop: '5px' 
                            }}>
                                {review.length} / 350
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="error-message" style={{ color: 'red', marginBottom: '15px', fontWeight: 'bold' }}>
                            {error}
                        </div>
                    )}
                    
                    <div className="rating-component">
                        <button 
                            className='rating-submit-btn' 
                            onClick={handleSubmitReview} 
                            disabled={submitLoading || !character}
                        > 
                            {submitLoading ? 'Saving Changes...' : isEditing ? 'Update Review' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RatingPage;