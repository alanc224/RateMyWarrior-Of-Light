import { useState, useEffect } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';

interface Review {
  _id: string;
  character_name: string;
  server: string;
  recommend: boolean;  
  rating: number; 
  comment: string;
  date: string; 
}

export default function UserProfilePage() {
  const { user } = useUser();
  const { getToken } = useAuth(); 
  const { openUserProfile } = useClerk(); 
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserReviews() {
        try {
        const token = await getToken({ template: 'api-template' });
        const response = await fetch('https://ratemywarrioroflight-api.onrender.com/api/reviews/user', {
            headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            setReviews(data);
        } else {
            console.error('API Error Status:', response.status);
            setReviews([]);
        }
        } catch (error) {
        console.error('Error fetching user reviews:', error);
        } finally {
        setLoading(false);
        }
    }

    fetchUserReviews();
    }, [getToken]);

  return (
    <div className="page-content">
      <h2>My Profile</h2>
      
      <div className="profile-details-block" style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', color: '#fff' }}>
          {user?.username || 'Warrior of Light'}
        </h3>
        <p className="muted-text" style={{ margin: '0 0 1.25rem 0' }}>
          {user?.primaryEmailAddress?.emailAddress}
        </p>
        
        <button 
            className="btn-mod" 
            onClick={() => openUserProfile()} 
            style={{ 
                backgroundColor: '#1c2436', 
                color: '#fff', 
                border: '1px solid #1f293d',
                display: 'flex',
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                cursor: 'pointer'
            }}
            >
          <span>⚙️</span> Manage Account
        </button>
      </div>

      <div className="activity-section">
        <h4 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', color: '#fff', borderBottom: '1px solid #1f293d', paddingBottom: '0.5rem' }}>
          My Posted Reviews ({reviews.length})
        </h4>

        {loading ? (
          <p className="muted-text">Loading Reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <p className="muted-text" style={{ margin: 0 }}>
              You haven't left a review.
            </p>
          </div>
        ) : (
          <div className="user-reviews-grid">
            {reviews.map((review) => (
              <div key={review._id} className="user-review-card">
                <div className="review-card-header">
                  <div>
                    <h5>{review.character_name}</h5>
                    <span className="review-world-tag">{review.server}</span>
                  </div>
                  <span className={`rating-indicator-badge ${review.recommend ? 'like' : 'dislike'}`}>
                    {review.recommend ? '👍 LIKE' : '👎 DISLIKE'} ({review.rating}/5)
                  </span>
                </div>
                <p className="review-card-body">"{review.comment}"</p>
                <div className="review-card-footer">
                  <span>Posted on: {new Date(review.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}