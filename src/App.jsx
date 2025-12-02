import React, { useState, useEffect } from 'react';
import { 
  getSchools, 
  getInstructors, 
  getSchoolById, 
  getInstructorById,
  searchSchools,
  searchInstructors,
  submitSchoolReview,
  submitInstructorReview
} from './supabase';

const availableTags = [
  "Patient", "Technical", "Creative", "Intense", "Entertaining", "Traditional",
  "No-Gi Specialist", "Gi Specialist", "Competition Focused", "Beginner Friendly",
  "Advanced Only", "Good with Kids", "Explains Well", "Hands-On", "Encouraging",
  "Demanding", "Flexible Schedule", "Detail Oriented", "Big Picture", "Leg Lock Expert",
  "Submission Hunter", "Positional Master", "Takedown Expert", "Guard Player"
];

const schoolCriteria = [
  { key: 'trainingPartnerQuality', dbKey: 'training_partner_quality', label: 'Training Partner Quality', icon: '🤝' },
  { key: 'curriculumQuality', dbKey: 'curriculum_quality', label: 'Curriculum Quality', icon: '📚' },
  { key: 'coachingQuality', dbKey: 'coaching_quality', label: 'Coaching Quality', icon: '🎯' },
  { key: 'classVariety', dbKey: 'class_variety', label: 'Class Variety', icon: '📋' },
  { key: 'schedule', dbKey: 'schedule', label: 'Schedule', icon: '🕐' },
  { key: 'cleanliness', dbKey: 'cleanliness', label: 'Cleanliness', icon: '✨' },
  { key: 'cost', dbKey: 'cost', label: 'Cost Value', icon: '💰' },
  { key: 'competitionSupport', dbKey: 'competition_support', label: 'Competition Support', icon: '🏆' },
  { key: 'injuryManagement', dbKey: 'injury_management', label: 'Injury Management', icon: '🏥' },
  { key: 'vibeFit', dbKey: 'vibe_fit', label: 'Vibe Fit', icon: '🔥' },
  { key: 'coachAvailability', dbKey: 'coach_availability', label: 'Coach Availability', icon: '👨‍🏫' },
  { key: 'studentRetention', dbKey: 'student_retention', label: 'Student Retention', icon: '📈' },
  { key: 'conflictHandling', dbKey: 'conflict_handling', label: 'Conflict Handling', icon: '⚖️' },
  { key: 'inclusivity', dbKey: 'inclusivity', label: 'Inclusivity', icon: '🌍' }
];

// Star Rating Component
const StarRating = ({ rating, size = 'md', interactive = false, onChange }) => {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 16, md: 24, lg: 32 };
  const starSize = sizes[size];
  
  return (
    <div className="star-rating" style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={starSize}
          height={starSize}
          viewBox="0 0 24 24"
          fill={(interactive ? hover || rating : rating) >= star ? '#FFD700' : 'none'}
          stroke={(interactive ? hover || rating : rating) >= star ? '#FFD700' : '#666'}
          strokeWidth="2"
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.15s ease' }}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(star)}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
};

// Autism Level Meter
const AutismMeter = ({ level, size = 'md', interactive = false, onChange }) => {
  const [hover, setHover] = useState(0);
  const sizes = { sm: 20, md: 28, lg: 36 };
  const meterSize = sizes[size];
  
  const getColor = (index, active) => {
    if (!active) return '#333';
    const colors = ['#4CAF50', '#8BC34A', '#FFEB3B', '#FF9800', '#F44336'];
    return colors[index];
  };
  
  return (
    <div className="autism-meter" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span style={{ fontSize: meterSize * 0.6, marginRight: '4px' }}>🧠</span>
      {[1, 2, 3, 4, 5].map((level_idx) => (
        <div
          key={level_idx}
          style={{
            width: meterSize * 0.4,
            height: meterSize,
            borderRadius: '4px',
            backgroundColor: getColor(level_idx - 1, (interactive ? hover || level : level) >= level_idx),
            cursor: interactive ? 'pointer' : 'default',
            transition: 'all 0.15s ease',
            transform: (interactive && hover === level_idx) ? 'scaleY(1.1)' : 'scaleY(1)'
          }}
          onMouseEnter={() => interactive && setHover(level_idx)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(level_idx)}
        />
      ))}
    </div>
  );
};

// Loading Spinner
const LoadingSpinner = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '4px solid #333',
      borderTop: '4px solid #ff3d3d',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

// Header Component
const Header = ({ currentView, setCurrentView, setSearchQuery }) => (
  <header className="header">
    <div className="header-content">
      <div className="logo" onClick={() => { setCurrentView('home'); setSearchQuery(''); }}>
        <span className="logo-icon">🥋</span>
        <span className="logo-text">RateMyProfessors<span className="logo-highlight">Autism</span></span>
      </div>
      <nav className="nav">
        <button 
          className={`nav-btn ${currentView === 'schools' ? 'active' : ''}`}
          onClick={() => setCurrentView('schools')}
        >
          Schools
        </button>
        <button 
          className={`nav-btn ${currentView === 'instructors' ? 'active' : ''}`}
          onClick={() => setCurrentView('instructors')}
        >
          Instructors
        </button>
      </nav>
    </div>
  </header>
);

// Search Component
const SearchBar = ({ searchQuery, setSearchQuery, searchType, setSearchType, onSearch }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <div className="search-type-toggle">
          <button 
            className={`toggle-btn ${searchType === 'all' ? 'active' : ''}`}
            onClick={() => setSearchType('all')}
          >
            All
          </button>
          <button 
            className={`toggle-btn ${searchType === 'schools' ? 'active' : ''}`}
            onClick={() => setSearchType('schools')}
          >
            Schools
          </button>
          <button 
            className={`toggle-btn ${searchType === 'instructors' ? 'active' : ''}`}
            onClick={() => setSearchType('instructors')}
          >
            Instructors
          </button>
        </div>
        <div className="search-input-wrapper">
          <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder={`Search ${searchType === 'all' ? 'schools or instructors' : searchType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
      </div>
    </div>
  );
};

// School Card Component
const SchoolCard = ({ school, onClick }) => (
  <div className="card school-card" onClick={onClick}>
    <div className="card-image" style={{ 
      backgroundImage: school.image_url ? `url(${school.image_url})` : 'none',
      backgroundColor: '#1a1a1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem'
    }}>
      {!school.image_url && '🏫'}
      <div className="card-badge">{school.reviewCount || 0} reviews</div>
    </div>
    <div className="card-content">
      <h3 className="card-title">{school.name}</h3>
      <p className="card-location">📍 {school.location}</p>
      {school.avgRatings && school.avgRatings.overall > 0 && (
        <div className="card-rating">
          <StarRating rating={school.avgRatings.overall} />
          <span className="rating-value">{school.avgRatings.overall.toFixed(1)}</span>
        </div>
      )}
    </div>
  </div>
);

// Instructor Card Component
const InstructorCard = ({ instructor, onClick }) => (
  <div className="card instructor-card" onClick={onClick}>
    <div className="card-image" style={{ 
      backgroundImage: instructor.image_url ? `url(${instructor.image_url})` : 'none',
      backgroundColor: '#1a1a1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem'
    }}>
      {!instructor.image_url && '👤'}
      <div className="card-badge belt-badge">{instructor.belt}</div>
    </div>
    <div className="card-content">
      <h3 className="card-title">{instructor.name}</h3>
      <p className="card-school">🏫 {instructor.schoolName}</p>
      <div className="dual-rating">
        <div className="rating-block">
          <span className="rating-label">Quality</span>
          <div className="rating-row">
            <StarRating rating={instructor.qualityRating || 0} size="sm" />
            <span className="rating-value">{(instructor.qualityRating || 0).toFixed(1)}</span>
          </div>
        </div>
        <div className="rating-block">
          <span className="rating-label">Autism Level</span>
          <div className="rating-row">
            <AutismMeter level={instructor.autismLevel || 0} size="sm" />
            <span className="rating-value">{(instructor.autismLevel || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>
      {instructor.tags && instructor.tags.length > 0 && (
        <div className="tags-preview">
          {instructor.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

// School Detail View
const SchoolDetail = ({ schoolId, onBack }) => {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratings, setRatings] = useState(
    schoolCriteria.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {})
  );
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchool();
  }, [schoolId]);

  const loadSchool = async () => {
    setLoading(true);
    const data = await getSchoolById(schoolId);
    setSchool(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitSchoolReview(schoolId, ratings, comment);
    setSubmitting(false);
    
    if (result.success) {
      alert('Review submitted! Thank you for your feedback.');
      setShowRatingForm(false);
      setRatings(schoolCriteria.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {}));
      setComment('');
      loadSchool(); // Reload to show new review
    } else {
      alert('Error submitting review. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!school) return <div>School not found</div>;

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>← Back to Schools</button>
      
      <div className="detail-header">
        <div className="detail-image" style={{ 
          backgroundImage: school.image_url ? `url(${school.image_url})` : 'none',
          backgroundColor: '#1a1a1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '5rem'
        }}>
          {!school.image_url && '🏫'}
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{school.name}</h1>
          <p className="detail-location">📍 {school.location}</p>
          {school.avgRatings && school.avgRatings.overall > 0 && (
            <div className="detail-rating">
              <StarRating rating={school.avgRatings.overall} size="lg" />
              <span className="rating-big">{school.avgRatings.overall.toFixed(1)}</span>
              <span className="review-count">({school.reviewCount} reviews)</span>
            </div>
          )}
          {(!school.avgRatings || school.avgRatings.overall === 0) && (
            <p style={{ color: '#888', marginBottom: '1rem' }}>No reviews yet - be the first!</p>
          )}
          <button className="rate-btn" onClick={() => setShowRatingForm(!showRatingForm)}>
            {showRatingForm ? 'Cancel' : '✍️ Rate This School'}
          </button>
        </div>
      </div>
      
      {showRatingForm && (
        <div className="rating-form">
          <h2>Rate {school.name}</h2>
          <div className="criteria-grid">
            {schoolCriteria.map((criterion) => (
              <div key={criterion.key} className="criterion-item">
                <div className="criterion-header">
                  <span className="criterion-icon">{criterion.icon}</span>
                  <span className="criterion-label">{criterion.label}</span>
                </div>
                <StarRating 
                  rating={ratings[criterion.key]} 
                  interactive 
                  onChange={(val) => setRatings({ ...ratings, [criterion.key]: val })}
                />
              </div>
            ))}
          </div>
          <div className="comment-section">
            <label>Your Review</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience training at this school..."
              rows={4}
            />
          </div>
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      )}
      
      {school.avgRatings && school.reviewCount > 0 && (
        <div className="ratings-breakdown">
          <h2>Ratings Breakdown</h2>
          <div className="breakdown-grid">
            {schoolCriteria.map((criterion) => (
              <div key={criterion.key} className="breakdown-item">
                <div className="breakdown-header">
                  <span>{criterion.icon} {criterion.label}</span>
                  <span className="breakdown-value">
                    {(school.avgRatings[criterion.dbKey] || 0).toFixed(1)}
                  </span>
                </div>
                <div className="breakdown-bar">
                  <div 
                    className="breakdown-fill" 
                    style={{ width: `${((school.avgRatings[criterion.dbKey] || 0) / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {school.reviews && school.reviews.length > 0 && (
        <div className="reviews-section">
          <h2>Reviews ({school.reviews.length})</h2>
          <div className="reviews-list">
            {school.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Instructor Detail View
const InstructorDetail = ({ instructorId, onBack }) => {
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [quality, setQuality] = useState(0);
  const [autism, setAutism] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInstructor();
  }, [instructorId]);

  const loadInstructor = async () => {
    setLoading(true);
    const data = await getInstructorById(instructorId);
    setInstructor(data);
    setLoading(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : prev.length < 5 ? [...prev, tag] : prev
    );
  };

  const handleSubmit = async () => {
    if (quality === 0 || autism === 0) {
      alert('Please rate both Quality and Autism Level');
      return;
    }
    
    setSubmitting(true);
    const result = await submitInstructorReview(instructorId, quality, autism, selectedTags, comment);
    setSubmitting(false);
    
    if (result.success) {
      alert('Review submitted! Thank you for your feedback.');
      setShowRatingForm(false);
      setQuality(0);
      setAutism(0);
      setSelectedTags([]);
      setComment('');
      loadInstructor();
    } else {
      alert('Error submitting review. Please try again.');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!instructor) return <div>Instructor not found</div>;

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>← Back to Instructors</button>
      
      <div className="detail-header instructor-header">
        <div className="detail-image round" style={{ 
          backgroundImage: instructor.image_url ? `url(${instructor.image_url})` : 'none',
          backgroundColor: '#1a1a1e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem'
        }}>
          {!instructor.image_url && '👤'}
        </div>
        <div className="detail-info">
          <h1 className="detail-title">{instructor.name}</h1>
          <p className="detail-school">🏫 {instructor.schoolName}</p>
          <p className="detail-belt">{instructor.belt}</p>
          
          <div className="dual-rating-large">
            <div className="rating-block-large">
              <span className="rating-label">Quality</span>
              <div className="rating-row">
                <StarRating rating={instructor.qualityRating || 0} size="lg" />
                <span className="rating-big">{(instructor.qualityRating || 0).toFixed(1)}</span>
              </div>
            </div>
            <div className="rating-block-large">
              <span className="rating-label">Autism Level</span>
              <div className="rating-row">
                <AutismMeter level={instructor.autismLevel || 0} size="lg" />
                <span className="rating-big">{(instructor.autismLevel || 0).toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          {instructor.tags && instructor.tags.length > 0 && (
            <div className="all-tags">
              {instructor.tags.map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
          
          {instructor.reviewCount === 0 && (
            <p style={{ color: '#888', marginTop: '1rem' }}>No reviews yet - be the first!</p>
          )}
          
          <button className="rate-btn" onClick={() => setShowRatingForm(!showRatingForm)}>
            {showRatingForm ? 'Cancel' : '✍️ Rate This Instructor'}
          </button>
        </div>
      </div>
      
      {showRatingForm && (
        <div className="rating-form">
          <h2>Rate {instructor.name}</h2>
          
          <div className="instructor-ratings">
            <div className="rating-section">
              <label>Quality Rating *</label>
              <p className="rating-desc">How good is this instructor at teaching?</p>
              <StarRating rating={quality} size="lg" interactive onChange={setQuality} />
            </div>
            
            <div className="rating-section">
              <label>Autism Level *</label>
              <p className="rating-desc">How obsessively dedicated are they to the craft?</p>
              <AutismMeter level={autism} size="lg" interactive onChange={setAutism} />
            </div>
          </div>
          
          <div className="tags-section">
            <label>Select Tags (up to 5)</label>
            <p className="rating-desc">What best describes this instructor?</p>
            <div className="tags-selector">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  className={`tag-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="comment-section">
            <label>Your Review</label>
            <textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience training with this instructor..."
              rows={4}
            />
          </div>
          
          <button 
            className="submit-btn" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      )}
      
      {instructor.reviews && instructor.reviews.length > 0 && (
        <div className="reviews-section">
          <h2>Reviews ({instructor.reviewCount})</h2>
          <div className="reviews-list">
            {instructor.reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-ratings">
                    <div className="review-rating">
                      <span>Quality:</span>
                      <StarRating rating={review.quality_rating} size="sm" />
                    </div>
                    <div className="review-rating">
                      <span>Autism:</span>
                      <AutismMeter level={review.autism_level} size="sm" />
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
                {review.tags && review.tags.length > 0 && (
                  <div className="review-tags">
                    {review.tags.map((tag, i) => (
                      <span key={i} className="tag small">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Home View
const HomeView = ({ setCurrentView, searchQuery, setSearchQuery, searchType, setSearchType, setSelectedSchool, setSelectedInstructor }) => {
  const [schools, setSchools] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [filteredSchools, setFilteredSchools] = useState([]);
  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    } else {
      setFilteredSchools([]);
      setFilteredInstructors([]);
    }
  }, [searchQuery, searchType]);

  const loadData = async () => {
    setLoading(true);
    const [schoolsData, instructorsData] = await Promise.all([
      getSchools(),
      getInstructors()
    ]);
    setSchools(schoolsData);
    setInstructors(instructorsData);
    setLoading(false);
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    
    if (searchType === 'all' || searchType === 'schools') {
      const results = await searchSchools(searchQuery);
      setFilteredSchools(results);
    } else {
      setFilteredSchools([]);
    }
    
    if (searchType === 'all' || searchType === 'instructors') {
      const results = await searchInstructors(searchQuery);
      setFilteredInstructors(results);
    } else {
      setFilteredInstructors([]);
    }
    
    setSearching(false);
  };

  if (loading) return <LoadingSpinner />;

  const showSchools = searchType === 'all' || searchType === 'schools';
  const showInstructors = searchType === 'all' || searchType === 'instructors';

  return (
    <div className="home-view">
      <div className="hero">
        <h1 className="hero-title">
          Find Your <span className="highlight">Perfect</span> Training Ground
        </h1>
        <p className="hero-subtitle">
          Rate and review martial arts schools and instructors. Find the right fit for your journey.
        </p>
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchType={searchType}
          setSearchType={setSearchType}
          onSearch={performSearch}
        />
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-number">{schools.length}</span>
            <span className="stat-text">Schools</span>
          </div>
          <div className="hero-stat">
            <span className="stat-number">{instructors.length}</span>
            <span className="stat-text">Instructors</span>
          </div>
        </div>
      </div>
      
      {searchQuery ? (
        <div className="search-results">
          {searching && <LoadingSpinner />}
          
          {!searching && showSchools && filteredSchools.length > 0 && (
            <section className="results-section">
              <h2>Schools ({filteredSchools.length})</h2>
              <div className="cards-grid">
                {filteredSchools.map((school) => (
                  <SchoolCard 
                    key={school.id} 
                    school={school} 
                    onClick={() => {
                      setSelectedSchool(school.id);
                      setCurrentView('school-detail');
                    }}
                  />
                ))}
              </div>
            </section>
          )}
          
          {!searching && showInstructors && filteredInstructors.length > 0 && (
            <section className="results-section">
              <h2>Instructors ({filteredInstructors.length})</h2>
              <div className="cards-grid">
                {filteredInstructors.map((instructor) => (
                  <InstructorCard 
                    key={instructor.id} 
                    instructor={instructor}
                    onClick={() => {
                      setSelectedInstructor(instructor.id);
                      setCurrentView('instructor-detail');
                    }}
                  />
                ))}
              </div>
            </section>
          )}
          
          {!searching && filteredSchools.length === 0 && filteredInstructors.length === 0 && (
            <div className="no-results">
              <span className="no-results-icon">🔍</span>
              <h3>No results found</h3>
              <p>Try a different search term or browse all schools and instructors</p>
            </div>
          )}
        </div>
      ) : (
        <div className="featured">
          <section className="featured-section">
            <div className="section-header">
              <h2>Browse Schools</h2>
              <button className="view-all" onClick={() => setCurrentView('schools')}>View All {schools.length} →</button>
            </div>
            <div className="cards-grid">
              {schools.slice(0, 6).map((school) => (
                <SchoolCard 
                  key={school.id} 
                  school={school}
                  onClick={() => {
                    setSelectedSchool(school.id);
                    setCurrentView('school-detail');
                  }}
                />
              ))}
            </div>
          </section>
          
          <section className="featured-section">
            <div className="section-header">
              <h2>Featured Instructors</h2>
              <button className="view-all" onClick={() => setCurrentView('instructors')}>View All {instructors.length} →</button>
            </div>
            <div className="cards-grid">
              {instructors.slice(0, 6).map((instructor) => (
                <InstructorCard 
                  key={instructor.id} 
                  instructor={instructor}
                  onClick={() => {
                    setSelectedInstructor(instructor.id);
                    setCurrentView('instructor-detail');
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

// Schools List View
const SchoolsView = ({ setSelectedSchool, setCurrentView }) => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setLoading(true);
    const data = await getSchools();
    setSchools(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="list-view">
      <div className="list-header">
        <h1>All Schools</h1>
        <p>{schools.length} schools listed</p>
      </div>
      <div className="cards-grid">
        {schools.map((school) => (
          <SchoolCard 
            key={school.id} 
            school={school}
            onClick={() => {
              setSelectedSchool(school.id);
              setCurrentView('school-detail');
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Instructors List View
const InstructorsView = ({ setSelectedInstructor, setCurrentView }) => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    setLoading(true);
    const data = await getInstructors();
    setInstructors(data);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="list-view">
      <div className="list-header">
        <h1>All Instructors</h1>
        <p>{instructors.length} instructors listed</p>
      </div>
      <div className="cards-grid">
        {instructors.map((instructor) => (
          <InstructorCard 
            key={instructor.id} 
            instructor={instructor}
            onClick={() => {
              setSelectedInstructor(instructor.id);
              setCurrentView('instructor-detail');
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  
  return (
    <div className="app">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        setSearchQuery={setSearchQuery}
      />
      
      <main className="main-content">
        {currentView === 'home' && (
          <HomeView 
            setCurrentView={setCurrentView}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchType={searchType}
            setSearchType={setSearchType}
            setSelectedSchool={setSelectedSchool}
            setSelectedInstructor={setSelectedInstructor}
          />
        )}
        
        {currentView === 'schools' && (
          <SchoolsView 
            setSelectedSchool={setSelectedSchool}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'instructors' && (
          <InstructorsView 
            setSelectedInstructor={setSelectedInstructor}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'school-detail' && selectedSchool && (
          <SchoolDetail 
            schoolId={selectedSchool}
            onBack={() => setCurrentView('schools')}
          />
        )}
        
        {currentView === 'instructor-detail' && selectedInstructor && (
          <InstructorDetail 
            instructorId={selectedInstructor}
            onBack={() => setCurrentView('instructors')}
          />
        )}
      </main>
      
      <footer className="footer">
        <p>🥋 RateMyProfessorsAutism.com — Find your training home</p>
        <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#606068' }}>
          Reviews are user-submitted opinions. We do not verify or endorse any content.
        </p>
      </footer>
    </div>
  );
}
