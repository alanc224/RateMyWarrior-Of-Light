import "./Review.css"

interface ReviewProps {
    rating: number,
    comment: string,
    date: string,
    playAgain: boolean,
    recommend: boolean,
    contentType: string,
    isOwner: boolean,
    onDelete: () => void,
    onEdit: () => void,
    onReport: () => void,
}
const Review = ({rating, comment, date, playAgain, recommend, contentType, isOwner, onDelete, onEdit, onReport} : ReviewProps) => {
    // let rating = 5;
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
        <div className='review-container'>
            <div className='review-rating-container'>
                <p>QUALITY</p>
                <div className={getBGColor(rating)}>{rating}.0</div>      
            </div>

            <div className='review-information-container'>
                <div className='badge-container'>
                    <span className='review-content-badge'>{contentType}</span>
                </div>
                
                <div className='review-meta-info'>
                    <span>Play Again: <strong>{playAgain ? 'Yes' : 'No'}</strong></span>
                    <span>Recommend: <strong>{recommend ? 'Yes' : 'No'}</strong></span>
                </div>

                <br />
                <p className='review-description'>{comment}</p>
            </div>
            <div className='review-date'>{date}</div>

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
    );
};

export default Review;