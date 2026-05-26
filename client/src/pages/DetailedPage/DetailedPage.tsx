import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BarChart from "../../components/Barchart/BarChart";
import "./DetailedPage.css";
import Header from '../../components/Header/Header';
import Review from "../../components/Review/Review";
import favicon1 from '../../assets/favicon1.png';
import iconImg from '../../assets/icon.webp';
import { allWorlds } from '../../data/worlds'; 

interface ReviewItem {
    rating: number;
    comment: string;
    date: string;
    playAgain: boolean;
    recommend: boolean;
    contentType: string;

}

const DetailedPage = () => {
    const { id } = useParams<{ id?: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [character, setCharacter] = useState(location.state || null);
    const [loading, setLoading] = useState(!location.state);
    const [ratings, setRatings] = useState([0, 0, 0, 0, 0]);
    const [average, setAverage] = useState(0);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);

    useEffect(() => {
        const fetchCharacter = async () => {
            if (!id || character) return; 
            try {
                const response = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/characters/${id}`);
                if (!response.ok) throw new Error("Character not found");
                const data = await response.json();
                console.log("API Response Data:", data);
                setCharacter(data);
            } catch (error) {
                console.error("Error fetching character:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCharacter();
    }, [id, character]);

        useEffect(() => {
            const getReviews = async () => {
                if (!id) return;
                try {
                    const response = await fetch(/*`http://localhost:5001/api/reviews/${id}/reviews`*/`https://ratemywarrioroflight-api.onrender.com/api/reviews/${id}/reviews`);
                    if (!response.ok) {
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
                                }) : "N/A",
                                playAgain: r.playAgain,
                                recommend: r.recommend,
                                contentType: r.contentType || "Other"
                            }))
                        );

                        const counts = [0, 0, 0, 0, 0]; // 1-5 stars
                        let total = 0;
                        let count = 0;
                        data.reviews.forEach((r: any) => {
                            if (r.rating >= 1 && r.rating <= 5) {
                                counts[5 - r.rating]++;
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

    const redirectRate = () => {
        if (!character) return;
        navigate(`/rating/${id}`, { state: character });
    };

    if (loading) return <div>Loading...</div>;
    if (!character) return <div>Character not found.</div>;

    const totalVotes = ratings.reduce((sum, count) => sum + count, 0);
    const roundedAverage = Math.round(average * 10) / 10;

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = visibleCount < reviews.length;

    const totalReviews = reviews.length;
    const playAgainPercent = totalReviews > 0 
    ? Math.round((reviews.filter(r => r.playAgain).length / totalReviews) * 100) 
    : 0;

    const recommendPercent = totalReviews > 0 
    ? Math.round((reviews.filter(r => r.recommend).length / totalReviews) * 100) 
    : 0;   

    const TombstoneURL = (baseUrl: string) => {
        if (!character) return;
        
        const formattedName = character.name.toLowerCase().replace(' ', '-');
        const fullUrl = `${baseUrl}/${id}/${formattedName}`;
        window.open(fullUrl, '_blank');
        };

    const FFlogsURL = () => {
        if (!character) return;
        try {
            const cleanWorld = character.world.split(' ')[0].trim();
            const worldData = allWorlds.find(w => 
                w.name.toLowerCase() === cleanWorld.toLowerCase()
            );
            
            if (!worldData) {
                console.error("World not found in allWorlds list!");
                return;
            }

            const regionMap: Record<string, string> = {
                'North America': 'na',
                'Europe': 'eu',
                'Japan': 'jp',
                'Oceania': 'oc'
            };

            const regionCode = regionMap[worldData.region];
            const formattedName = character.name.trim().replace(' ', '%20');
            const url = `https://www.fflogs.com/character/${regionCode}/${worldData.name.toLowerCase()}/${formattedName}`;
            
            console.log("Opening FFLogs URL:", url);
            window.open(url, '_blank');
            
        } catch (error) {
            console.error("FFlogsURL Error:", error);
        }
    };

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
                        
                        <p className='player-overall-quality'>
                            {totalVotes !== 0 ? `Overall Quality Based on ${totalVotes} ` : "No ratings yet. "} 
                            <span style={{ textDecoration: 'underline' }}>
                                {totalVotes !== 0 ? "rating(s)" : "Add a rating."}
                            </span>
                        </p>
                        
                        <p className='player-name'>{character.name}</p>
                        <p className='player-blurb'>Player in the {character.server} server</p>
                        
                        {totalVotes > 0 && (
                            <div className='stats-container'>
                                <div className='stat-item'>
                                    <span className='stat-value'>{playAgainPercent}%</span>
                                    <span className='stat-label'>Would play again</span>
                                </div>
                                <div className='stat-item'>
                                    <span className='stat-value'>{recommendPercent}%</span>
                                    <span className='stat-label'>Recommend</span>
                                </div>
                            </div>
                        )}

                        <div className='rate-and-actions-wrapper'>
                            <button className='rate-btn' onClick={redirectRate}>Rate!</button>
                            
                            <div className='action-button-group'>
                                <button className='image-btn' onClick={FFlogsURL}>
                                    <img src={favicon1} alt="FFLogs" />
                                </button>
                                <button className='image-btn' onClick={() => TombstoneURL('https://tomestone.gg/character')}>
                                    <img src={iconImg} alt="Toombstone" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='bar-graph-container'>
                        <h3>Rating Distribution</h3>
                        <BarChart ratings={ratings} />
                    </div>
                </div>
                <hr />
                <div className='reviews-container'>
                    {visibleReviews.map((e, i) => {
                        return <Review key={i} rating={e.rating} comment={e.comment} date={e.date} playAgain={e.playAgain} recommend={e.recommend} contentType={e.contentType} />
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
