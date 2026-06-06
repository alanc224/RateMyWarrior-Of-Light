import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import BarChart from "../../components/Barchart/BarChart";
import "./DetailedPage.css";
import Header from '../../components/Header/Header';
import Review from "../../components/Review/Review";
import favicon1 from '../../assets/favicon1.png';
import iconImg from '../../assets/icon.webp';
import lodestone from '../../assets/lodestone.png';
import { allWorlds } from '../../data/worlds'; 
import { useAuth } from '@clerk/clerk-react';

interface ReviewItem {
    id: string;
    _id?: string;
    rating: number;
    comment: string;
    date: string;
    playAgain: boolean;
    recommend: boolean;
    contentType: string;
    isOwner: boolean;
}

const DetailedPage = () => {
    const { id } = useParams<{ id?: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { isSignedIn, getToken, isLoaded } = useAuth();
    const [character, setCharacter] = useState(location.state || null);
    const [loading, setLoading] = useState(!location.state);
    // const [ratings, setRatings] = useState([0, 0, 0, 0, 0]);
    // const [average, setAverage] = useState(0);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [reviewToReport, setReviewToReport] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState("");

    useEffect(() => {
        if (character) {
            setLoading(false);
            return;
        }
        const fetchCharacter = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/players/${id}`);
                if (!response.ok) throw new Error("Character not found");
                const data = await response.json();
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
        if (!id || !isLoaded) return;

        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };
            if (isSignedIn) {
                const token = await getToken({ template: 'api-template' });
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } else {
                    console.warn("Frontend isSignedIn is true, but getToken() returned null.");
                }
            }

            const response = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/reviews/${id}/reviews`, {
                method: 'GET',
                headers: headers
            });
            
            if (!response.ok) return;
            const data = await response.json();

            if (data.reviews && Array.isArray(data.reviews)) {
                setReviews(
                    data.reviews.map((r: any) => ({
                        id: r.id,
                        rating: r.rating,
                        comment: r.comment,
                        date: r.date ? new Date(r.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        }) : "N/A",
                        playAgain: r.playAgain,
                        recommend: r.recommend,
                        contentType: r.contentType || "Other",
                        isOwner: r.isOwner
                    }))
                );
                /*
                const counts = [0, 0, 0, 0, 0];
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
                */
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    getReviews();
    }, [id, isSignedIn, isLoaded]);

    const redirectRate = () => {
        if (!character) return;
        const resolvedId = character.id || character.character_id || id || "";
        const resolvedName = character.name || character.characterName || character.character_name || "Unknown Character";
        const resolvedServer = character.server || character.serverName || character.world || "Unknown Server";

        navigate(`/rating/${id}`, { 
            state: {
                id: String(resolvedId),
                name: resolvedName, 
                server: resolvedServer,
                portrait: character.portrait || "",
                world: character.world || resolvedServer
            } 
        });
    };

    if (loading) return <div>Loading...</div>;
    if (!character) return <div>Character not found.</div>;

    const totalReviews = reviews.length;
    const dynamicRatings = [0, 0, 0, 0, 0];
    let totalScore = 0;

    reviews.forEach(r => {
        if (r.rating >= 1 && r.rating <= 5) {
            dynamicRatings[5 - r.rating]++;
            totalScore += r.rating;
        }
    });

    const averageRating = totalReviews > 0 ? totalScore / totalReviews : 0;
    const roundedAverage = Math.round(averageRating * 10) / 10;

    const playAgainPercent = totalReviews > 0 
        ? Math.round((reviews.filter(r => r.playAgain).length / totalReviews) * 100) 
        : 0;

    const recommendPercent = totalReviews > 0 
        ? Math.round((reviews.filter(r => r.recommend).length / totalReviews) * 100) 
        : 0;

    const visibleReviews = reviews.slice(0, visibleCount);
    const hasMore = visibleCount < reviews.length;

    const TomestoneURL = (baseUrl: string) => {
        if (!character) return;
        const characterName = character.name || character.characterName || character.character_name || "";
        
        if (!characterName) {
            console.error("TombstoneURL Error: Character name is missing entirely from state/API data.");
            return;
        }

        const formattedName = characterName.toLowerCase().replace(' ', '-');
        const fullUrl = `${baseUrl}/${id}/${formattedName}`;
        window.open(fullUrl, '_blank');
    };

    const FFlogsURL = () => {
        if (!character) return;
        try {
            const characterName = character.name || character.characterName || character.character_name || "";
            const characterWorld = character.world || character.server || character.serverName || "";

            if (!characterName || !characterWorld) {
                console.error("FFlogsURL Error: Missing required name or world string fields.", { characterName, characterWorld });
                return;
            }

            const cleanWorld = characterWorld.split(' ')[0].trim();
            const worldData = allWorlds.find(w => 
                w.name.toLowerCase() === cleanWorld.toLowerCase()
            );
            
            if (!worldData) {
                console.error("World not found in allWorlds list!", cleanWorld);
                return;
            }

            const regionMap: Record<string, string> = {
                'North America': 'na',
                'Europe': 'eu',
                'Japan': 'jp',
                'Oceania': 'oc'
            };

            const regionCode = regionMap[worldData.region];
            const formattedName = characterName.trim().replace(' ', '%20');
            const url = `https://www.fflogs.com/character/${regionCode}/${worldData.name.toLowerCase()}/${formattedName}`;

            window.open(url, '_blank');
            
        } catch (error) {
            console.error("FFlogsURL Error:", error);
        }
    };
    const handleDeleteReview = async (reviewId: string) => {   
        if (!reviewId) return;
        try {
            const token = await getToken({ template: 'api-template' });
            const response = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to delete the review.");
            }
            // window.location.reload();
            setReviews(prevReviews => prevReviews.filter(r => (r._id || r.id) !== reviewId));
            setReviewToDelete(null);


        } catch (error) {
            console.error("Delete Error:", error);
            alert("Could not delete your review at this time.");
        } finally {
        setIsDeleting(false);
        }
    }; 

    const handleReportReview = async () => {
        if (!reviewToReport) return;
        const reviewData = reviews.find(r => (r._id || r.id) === reviewToReport);
        try {
            const token = await getToken({ template: 'api-template' });
            const res = await fetch(`https://ratemywarrioroflight-api.onrender.com/api/reports`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ 
                    reviewId: reviewToReport,
                    reason: reportReason || "No reason provided" ,
                    characterName: character.characterName || character.name,
                    server: character.serverName || character.server,
                    reviewContent: reviewData?.comment || ""
                })
            });

            if (res.ok) alert("Report submitted for review.");
            else alert("Failed to submit report.");
        } catch (err) {
            console.error("Report failure:", err);
        } finally {
            setReviewToReport(null);
            setReportReason("");
        }
    };

    return (
        <>
            <Header />
            <div className='detail-page'>
                <div className='detailpage-container'>
                    <div className='player-details'>
                        <div className='rating-container'>
                            <span className='player-rating-score'>{totalReviews !== 0 ? roundedAverage : "N/A"}</span>
                            <span className='player-rating-max-score'>/ 5</span>
                        </div>
                        
                        <p className='player-overall-quality'>
                        {totalReviews !== 0 ? `Overall Quality Based on ${totalReviews} ` : "No ratings yet. "} 
                        <span style={{ textDecoration: 'underline' }}>
                            {totalReviews !== 0 ? "rating(s)" : "Add a rating."}
                        </span>
                    </p>
                        
                        <p className='player-name'>{character.characterName || character.name}</p>
                        <p className='player-blurb'>Player in the {character.serverName || character.server} server</p>
                        
                        {totalReviews > 0 && (
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
                                <button className='image-btn' onClick={() => TomestoneURL('https://tomestone.gg/character')}>
                                    <img src={iconImg} alt="Tomestone" />
                                </button>
                                <button 
                                    className='image-btn' 
                                    onClick={() => window.open(`https://na.finalfantasyxiv.com/lodestone/character/${id}`, '_blank', 'noopener,noreferrer')}
                                    >
                                    <img src={lodestone} alt="Lodestone" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className='bar-graph-container'>
                        <h3>Rating Distribution</h3>
                        <BarChart ratings={dynamicRatings} />
                    </div>
                </div>
                <hr />
                <div className='reviews-container'>
                    {visibleReviews.map((e) => {
                        return (
                            <Review 
                                key={e.id} 
                                rating={e.rating} 
                                comment={e.comment} 
                                date={e.date} 
                                playAgain={e.playAgain} 
                                recommend={e.recommend} 
                                contentType={e.contentType} 
                                isOwner={e.isOwner} 
                                onDelete={() => setReviewToDelete(e._id || e.id)}
                                onReport={() => setReviewToReport(e._id || e.id)}
                                onEdit={() => navigate(`/rating/${id}`, { 
                                    state: { 
                                        character: character, 
                                        editReviewData: e
                                    } 
                                })} 
                            />
                        );
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
            {reviewToDelete && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-card">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to permanently delete your review?</p>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setReviewToDelete(null)}>Cancel</button>
                            <button 
                                className="modal-btn confirm-delete" 
                                disabled={isDeleting}
                                onClick={async () => {
                                    setIsDeleting(true);
                                    await handleDeleteReview(reviewToDelete!);
                                    setIsDeleting(false);
                                    setReviewToDelete(null); 
                                }}
                            >
                                {isDeleting ? "Deleting..." : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {reviewToReport && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal-card">
                        <h3>Report Review</h3>
                        <p>Please select a reason for reporting:</p>
                        
                        <select 
                            value={reportReason} 
                            onChange={(e) => setReportReason(e.target.value)}
                            className="report-reason-select"
                        >
                            <option value="" disabled>Select a reason...</option>
                            <option value="Offensive Language">Offensive Language</option>
                            <option value="Spam or Advertising">Spam or Advertising</option>
                            <option value="Off Topic">Off Topic</option>
                            <option value="Harassment">Harassment</option>
                            <option value="Inaccurate Information">Inaccurate Information</option>
                            <option value="Other">Other</option>
                        </select>

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setReviewToReport(null)}>Cancel</button>
                            <button 
                                className="modal-btn confirm-delete" 
                                disabled={!reportReason}
                                onClick={handleReportReview}
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DetailedPage;
