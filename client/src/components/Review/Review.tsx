import { useAuth } from '@clerk/clerk-react'; 
import { useState } from "react";
import "./Review.css";

interface ReviewProps {
    reviewId: string;
    rating: number;
    comment: string;
    date: string;
    playAgain: boolean;
    recommend: boolean;
    contentType: string;
    isOwner: boolean;
    onDelete: () => void;
    onEdit: () => void;
    onReport: () => void;
    initialUpvotes?: number;
    initialDownvotes?: number;
    initialUserVote?: "up" | "down" | null;
}

const Review = ({
    reviewId,
    rating, 
    comment, 
    date, 
    playAgain, 
    recommend, 
    contentType, 
    isOwner, 
    onDelete, 
    onEdit, 
    onReport,
    initialUpvotes = 0, 
    initialDownvotes = 0,
    initialUserVote = null
} : ReviewProps) => {
    
    const { getToken, isSignedIn } = useAuth();
    const [userVote, setUserVote] = useState<"up" | "down" | null>(initialUserVote);
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [downvotes, setDownvotes] = useState(initialDownvotes);

    const handleVote = async (type: "up" | "down") => {
        if (!isSignedIn) {
            alert("You must be signed in to vote on reviews!");
            return;
        }

        if (isOwner) {
            alert("You cannot upvote or downvote your own review!");
            return;
        }

        let newVote: "up" | "down" | null = type;

        if (userVote === type) {
            newVote = null;
            type === "up" ? setUpvotes(prev => prev - 1) : setDownvotes(prev => prev - 1);
        } else {
            if (userVote === "up") setUpvotes(prev => prev - 1);
            if (userVote === "down") setDownvotes(prev => prev - 1);

            type === "up" ? setUpvotes(prev => prev + 1) : setDownvotes(prev => prev + 1);
        }

        setUserVote(newVote);

        try {
            const token = await getToken({ template: 'api-template' });

            const response = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/reviews/${reviewId}/vote`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ voteType: newVote }), 
            });

            if (!response.ok) {
                throw new Error("Failed to sync vote with server");
            }
        } catch (error) {
            console.error("Voting error:", error);
        }
    };

    const getBGColor = (rating : number) => {
        if (rating == 1 || rating == 2){
            return 'red'
        } else if (rating == 3){
            return 'yellow'
        } else {
            return 'green'
        }
    }

    return (
        <div className="review-container">
            <div className="review-rating-container">
                <p>QUALITY</p>
                <div className={getBGColor(rating)}>{rating}.0</div>      
            </div>

            <div className="review-information-container">
                <div className="badge-container">
                    <span className="review-content-badge">{contentType}</span>
                </div>
                
                <div className="review-meta-info">
                    <span>Play Again: <strong>{playAgain ? "Yes" : "No"}</strong></span>
                    <span>Recommend: <strong>{recommend ? "Yes" : "No"}</strong></span>
                </div>

                <br />
                <p className="review-description">{comment}</p>
            </div>
            
            <div className="review-date">{date}</div>

            <div className="review-footer-container">
                
                <div className="review-vote-container">
                    <button 
                        className={`vote-btn upvote ${userVote === "up" ? "active" : ""}`}
                        onClick={() => handleVote("up")}
                        aria-label="Upvote"
                        style={isOwner ? { opacity: 0.25, cursor: 'not-allowed' } : {}}
                        title={isOwner ? "You cannot vote on your own review" : ""}
                        disabled={isOwner}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill={userVote === "up" ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                        <span className="vote-count">{upvotes}</span>
                    </button>

                    <button 
                        className={`vote-btn downvote ${userVote === "down" ? "active" : ""}`}
                        onClick={() => handleVote("down")}
                        aria-label="Downvote"
                        style={isOwner ? { opacity: 0.25, cursor: 'not-allowed' } : {}}
                        title={isOwner ? "You cannot vote on your own review" : ""}
                        disabled={isOwner}
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill={userVote === "down" ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm12-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h3" />
                        </svg>
                        <span className="vote-count">{downvotes}</span>
                    </button>
                </div>

                <div className="review-actions-container">
                    {isOwner ? (
                        <>
                            <button onClick={onEdit} className="review-action-btn edit">
                                Edit
                            </button>
                            <button onClick={onDelete} className="review-action-btn delete">
                                Delete
                            </button>
                        </>
                    ) : (
                        <button onClick={onReport} className="review-action-btn report">
                            Report
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Review;