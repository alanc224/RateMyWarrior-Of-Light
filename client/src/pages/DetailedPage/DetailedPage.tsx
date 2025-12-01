import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BarChart from "../../components/Barchart/BarChart";
import "./DetailedPage.css";
import Header from '../../components/Header/Header';
import Review from "../../components/Review/Review";

interface ReviewItem {
    rating: number;
    comment: string;
    date: string;
}

const DetailedPage = () => {
    const { id } = useParams<{ id?: string }>();
    const location = useLocation();
    const state = location.state;

    const redirectRate = () => {
        navigate(`/rating/${id}`, {
            state: {
                id: state.id,
                name: state.name,
                portrait: state.portrait,
                server: state.server,
                world: state.world
            }
        });
    };

    const [ratings, setRatings] = useState([0, 0, 0, 0, 0]);
    const [average, setAverage] = useState(0);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);

    useEffect(() => {
        const getReviews = async () => {
            if (!id) return;

            try {
                const response = await fetch(/*`http://localhost:5001/api/reviews/${id}/reviews`*/`https://ratemywarrioroflight-api.onrender.com/api/reviews/${id}/reviews`);
                if (!response.ok) {
                    console.error("Failed to fetch reviews:", response.statusText);
                    return;
                }
                const data = await response.json();

                if (data.reviews && Array.isArray(data.reviews)) {
                    setReviews(
                        data.reviews.map((r: any) => ({
                            rating: r.rating,
                            comment: r.comment,
                            date: r.date ? new Date(r.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }) : "N/A"
                        }))
                    );

                    const counts = [0, 0, 0, 0, 0]; // 1-5 stars
                    let total = 0;
                    let count = 0;
                    data.reviews.forEach((r: any) => {
                        if (r.rating >= 1 && r.rating <= 5) {
                            counts[r.rating - 1]++;
                            total += r.rating;
                            count++;
                        }
                    });
                    setRatings(counts);
                    setAverage(count > 0 ? total / count : 0);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        getReviews();
    }, [id]);

    const totalVotes = ratings.reduce((sum, count) => sum + count, 0);
    const roundedAverage = Math.round(average * 10) / 10;

    const [visibleCount, setVisibleCount] = useState(3);

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = visibleCount < reviews.length;

    const navigate = useNavigate();
    // const [newQuery, setNewQuery] = useState("");

    // What are these functions for? commenting out until used
    /* function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' && newQuery) {
            navigate(`/results/player/${newQuery}`);
        }
    }
     function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewQuery(event.target.value);
    } */ 

    return (
        <>
            <Header />
            <div className='detail-page'>
                <div className='detailpage-container'>
                    <div className='player-details'>
                        <div className='rating-container'>
                            <span className='player-rating-score'>{totalVotes !== 0 ? roundedAverage : "N/A"}</span>
                            <span className='player-rating-max-score'>/ 5</span>
                        </div>
                        <p className='player-overall-quality'>{totalVotes !== 0 ? "Overall Quality Based on" : "No ratings yet."} <span style={{ textDecoration: 'underline' }}>{totalVotes !== 0 ? "ratings" : "Add a rating."}</span></p>
                        <p className='player-name'>{state.name}</p>
                        <p className='player-blurb'>Player in the {state.server} server</p>
                        <button className='rate-btn' onClick={redirectRate}>Rate!</button>
                    </div>
                    <div className='bar-graph-container'>
                        <h3>Rating Distribution</h3>
                        <BarChart ratings={ratings} />
                    </div>
                </div>
                <hr />
                <div className='reviews-container'>
                    {visibleReviews.map((e, i) => {
                        return <Review key={i} rating={e.rating} comment={e.comment} date={e.date} id={id!} />
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
};

export default DetailedPage;
