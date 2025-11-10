import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BarChart from "../../components/Barchart/BarChart";
import "./DetailedPage.css"
import Header from '../../components/Header/Header';
import Review from "../../components/Review/Review";
interface ReviewItem {
    rating: number;
    comment: string;
    date: string;
}
interface DetailedPageProps {
    onLoginClick: () => void;
    onSignUpClick: () => void;
}
const DetailedPage = ({onLoginClick, onSignUpClick}: DetailedPageProps) => {
    const { id } = useParams<{ 
        id?: string; 
    }>();
    const location = useLocation();
    const state = location.state

    const redirectRate = () => {
        navigate(`/rating/${id}`, {
            state: {
                id: state.id,
                name: state.name,
                portrait: state.portrait,
                server: state.server,
                world: state.world
            }
        })
    }
    // Temp** fetch for ratings
    const [ratings, setRatings] = useState([0,0,0,0,0])
    const [average, setAverage] = useState(0);
    useEffect(() => {
        const getReviews = async () => {
            const response = await fetch(`http://localhost:5001/review/character/${id}`);
            const data = await response.json()
            setRatings(data.ratings)
            setAverage(data.average)
        }
        getReviews()

    },[])
    // let ratings = [12, 4, 1, 3, 1];
    const totalVotes = ratings.reduce((sum, count) => sum + count, 0);

    // const weightedSum = ratings.reduce((sum, count, index) => {
    //     const weight = 5 - index;
    //     return sum + count * weight;
    // }, 0);

    // const average = totalVotes === 0 ? 0 : weightedSum / totalVotes;
    const roundedAverage = Math.round(average * 10) / 10;

    const [visibleCount, setVisibleCount] = useState(3);
    
    // Temp** Fetch reviews for this id
    const [reviews, setReviews] = useState<ReviewItem[]>([
        {
            rating: 5,
            comment: "cool",
            date: 'Oct 1st, 2025'
        },
        {
            rating: 3,
            comment: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Modi labore quod quos dolor. Voluptatibus saepe officia reiciendis enim aperiam pariatur odio cupiditate neque recusandae, voluptatem dolores sunt placeat? Soluta, iure?",
            date: 'March 1st, 2025'
        }, 
        {
            rating: 2,
            comment: "this player is the worst player ever",
            date: 'Jan 1st, 2025'

        },
        {
            rating: 2,
            comment: "this player is the worst player ever",
            date: 'Jan 1st, 2025'

        }

    ]);
    const visibleReviews = reviews.slice(0, visibleCount);
    let hasMore = visibleCount < reviews.length
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
            <div className='detail-page'>
                <div className='detailpage-container'>
                    <div className='player-details'>
                        <div className='rating-container'>
                            <span className='player-rating-score'>{totalVotes != 0 ? roundedAverage : "N/A"}</span><span className='player-rating-max-score'>/ 5</span>
                        </div>
                        <p className='player-overall-quality'>{totalVotes != 0 ? "Overall Quality Based on" : "No ratings yet."} <span style={{ textDecoration: 'underline' }}>{totalVotes != 0 ? "ratings" : "Add a rating."}</span></p>
                        <p className='player-name'>{state.name}</p>
                        <p className='player-blurb'>Player in the {state.server} server</p>
                        <button className='rate-btn' onClick={redirectRate}>Rate!</button>
                    </div>
                    <div className='bar-graph-container'>
                        <h3>Rating Distribution</h3>
                        <BarChart ratings={ratings}/>
                    </div>
                </div>
                <hr></hr>
                <div className='reviews-container'>
                    {visibleReviews.map((e, i) => {
                        return <Review key={i} rating={e.rating} comment={e.comment} date={e.date}id={id!}/>
                    })}
                    {hasMore && (
                <div className='load-more-ratings-btn'>
                    <button className='black-rounded-btn' onClick={() => setVisibleCount(prev => prev + 3)}>
                        Load More Ratings
                    </button>
                </div>
            )}
                </div>
            </div>
        </>

    );

}

export default DetailedPage;