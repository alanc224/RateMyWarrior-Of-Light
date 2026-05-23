import "./Review.css"

interface ReviewProps {
    rating: number,
    comment: string,
    date: string,
    id: string,
    playAgain: boolean,
    recommend: boolean
}
const Review = ({rating, comment, date, id, playAgain, recommend} : ReviewProps) => {
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
                <p className='review-player-id'>{id}</p>
                <div className='review-meta-info' style={{ marginTop: '5px', fontSize: '0.9em', color: '#555' }}>
                    <span>Play Again: <strong>{playAgain ? 'Yes' : 'No'}</strong></span>
                    <span style={{ marginLeft: '10px' }}>Recommend: <strong>{recommend ? 'Yes' : 'No'}</strong></span>
                </div>
                <br></br>
                {/* <span>Test</span> <span>test 2</span> */}
                {/* <br></br><br></br> */}
                <p className='review-description'>
                    {comment}
                    {/* Lorem ipsum, dolor sit amet consectetur adipisicing elit. Error natus corporis soluta. Tempora tenetur nobis a iure neque sunt, voluptatum ipsa officia veritatis magni iste? Saepe deleniti deserunt ipsa repellendus. */}
                </p>
                {/* <div className='review-upvotes'>
                    Helpful <i>0 Upvotes</i> <i>0 Downvotes</i>
                </div> */}
            </div>
            <div className='review-date'>{date}</div>
            
        </div>
    );
};

export default Review;