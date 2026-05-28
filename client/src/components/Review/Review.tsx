import "./Review.css"

interface ReviewProps {
    rating: number,
    comment: string,
    date: string,
    playAgain: boolean,
    recommend: boolean
    contentType: string;
    isOwner: boolean;
    onDelete: () => void;
    onEdit: () => void;
}
const Review = ({rating, comment, date, playAgain, recommend, contentType, isOwner, onDelete, onEdit} : ReviewProps) => {
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

        <div className="review-actions-wrapper" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                {isOwner ? (
                    <>
                        <button onClick={onEdit} className="edit-review-btn" style={{ backgroundColor: '#48cae4', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                            Edit
                        </button>
                        <button onClick={onDelete} className="delete-review-btn" style={{ backgroundColor: '#e63946', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                            Delete
                        </button>
                    </>
                ) : (
                    <button onClick={() => alert("Reported placeholder clicked")} className="report-review-btn" style={{ backgroundColor: '#ecefe6', color: '#333', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                        Report
                    </button>
                )}
            </div>
            
        </div>
    );
};

export default Review;