import React, { useState, useEffect } from 'react';

// Sample data - in production this would come from a database
const sampleSchools = [
  {
    id: 1,
    name: "10th Planet Jiu Jitsu",
    location: "Los Angeles, CA",
    image: "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400",
    overallRating: 4.2,
    reviewCount: 47,
    ratings: {
      trainingPartnerQuality: 4.5,
      curriculumQuality: 4.8,
      coachingQuality: 4.6,
      classVariety: 4.2,
      schedule: 3.8,
      cleanliness: 4.0,
      cost: 3.2,
      competitionSupport: 4.7,
      injuryManagement: 4.1,
      vibeFit: 4.5,
      coachAvailability: 4.0,
      studentRetention: 4.3,
      conflictHandling: 3.9,
      inclusivity: 4.6
    }
  },
  {
    id: 2,
    name: "Gracie Barra HQ",
    location: "Irvine, CA",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
    overallRating: 4.5,
    reviewCount: 89,
    ratings: {
      trainingPartnerQuality: 4.6,
      curriculumQuality: 4.9,
      coachingQuality: 4.7,
      classVariety: 4.5,
      schedule: 4.2,
      cleanliness: 4.8,
      cost: 3.0,
      competitionSupport: 4.8,
      injuryManagement: 4.4,
      vibeFit: 4.2,
      coachAvailability: 4.1,
      studentRetention: 4.5,
      conflictHandling: 4.2,
      inclusivity: 4.7
    }
  },
  {
    id: 3,
    name: "Atos Jiu Jitsu",
    location: "San Diego, CA",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
    overallRating: 4.7,
    reviewCount: 62,
    ratings: {
      trainingPartnerQuality: 4.9,
      curriculumQuality: 4.7,
      coachingQuality: 4.8,
      classVariety: 4.3,
      schedule: 4.0,
      cleanliness: 4.5,
      cost: 2.8,
      competitionSupport: 5.0,
      injuryManagement: 4.2,
      vibeFit: 4.6,
      coachAvailability: 4.3,
      studentRetention: 4.7,
      conflictHandling: 4.0,
      inclusivity: 4.4
    }
  }
];

const sampleInstructors = [
  {
    id: 1,
    name: "Eddie Bravo",
    schoolId: 1,
    schoolName: "10th Planet Jiu Jitsu",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    belt: "Black Belt",
    qualityRating: 4.8,
    autismLevel: 4.9,
    reviewCount: 156,
    tags: ["Rubber Guard Master", "Creative", "Conspiracy Theorist", "No-Gi Specialist", "Entertaining"],
    reviews: [
      { id: 1, quality: 5, autism: 5, comment: "Eddie's teaching style is unmatched. His passion for the game is infectious.", tags: ["Creative", "Entertaining"], date: "2025-08-15" },
      { id: 2, quality: 5, autism: 5, comment: "The most dedicated instructor I've ever trained with. Goes down rabbit holes but that's part of the charm.", tags: ["Rubber Guard Master", "No-Gi Specialist"], date: "2025-07-22" }
    ]
  },
  {
    id: 2,
    name: "Carlos Gracie Jr",
    schoolId: 2,
    schoolName: "Gracie Barra HQ",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    belt: "Red Belt",
    qualityRating: 4.9,
    autismLevel: 4.2,
    reviewCount: 203,
    tags: ["Legend", "Technical", "Traditional", "Gi Specialist", "Patient"],
    reviews: [
      { id: 1, quality: 5, autism: 4, comment: "Learning from a Gracie is a privilege. Incredibly technical and methodical approach.", tags: ["Technical", "Traditional"], date: "2025-09-01" }
    ]
  },
  {
    id: 3,
    name: "Andre Galvao",
    schoolId: 3,
    schoolName: "Atos Jiu Jitsu",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    belt: "Black Belt",
    qualityRating: 4.9,
    autismLevel: 4.7,
    reviewCount: 178,
    tags: ["ADCC Champion", "Intense", "Competition Focused", "World Class", "Demanding"],
    reviews: [
      { id: 1, quality: 5, autism: 5, comment: "Andre's intensity is unreal. If you want to compete, this is your guy.", tags: ["Intense", "Competition Focused"], date: "2025-08-28" }
    ]
  }
];

const availableTags = [
  "Patient", "Technical", "Creative", "Intense", "Entertaining", "Traditional",
  "No-Gi Specialist", "Gi Specialist", "Competition Focused", "Beginner Friendly",
  "Advanced Only", "Good with Kids", "Explains Well", "Hands-On", "Encouraging",
  "Demanding", "Flexible Schedule", "Detail Oriented", "Big Picture", "Leg Lock Expert",
  "Submission Hunter", "Positional Master", "Takedown Expert", "Guard Player"
];

const schoolCriteria = [
  { key: 'trainingPartnerQuality', label: 'Training Partner Quality', icon: '🤝' },
  { key: 'curriculumQuality', label: 'Curriculum Quality', icon: '📚' },
  { key: 'coachingQuality', label: 'Coaching Quality', icon: '🎯' },
  { key: 'classVariety', label: 'Class Variety', icon: '📋' },
  { key: 'schedule', label: 'Schedule', icon: '🕐' },
  { key: 'cleanliness', label: 'Cleanliness', icon: '✨' },
  { key: 'cost', label: 'Cost Value', icon: '💰' },
  { key: 'competitionSupport', label: 'Competition Support', icon: '🏆' },
  { key: 'injuryManagement', label: 'Injury Management', icon: '🏥' },
  { key: 'vibeFit', label: 'Vibe Fit', icon: '🔥' },
  { key: 'coachAvailability', label: 'Coach Availability', icon: '👨‍🏫' },
  { key: 'studentRetention', label: 'Student Retention', icon: '📈' },
  { key: 'conflictHandling', label: 'Conflict Handling', icon: '⚖️' },
  { key: 'inclusivity', label: 'Inclusivity', icon: '🌍' }
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

// Autism Level Meter (fun visual)
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
        <button className="nav-btn cta">+ Add Rating</button>
      </nav>
    </div>
  </header>
);

// Search Component
const SearchBar = ({ searchQuery, setSearchQuery, searchType, setSearchType }) => (
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
        />
        {searchQuery && (
          <button className="clear-btn" onClick={() => setSearchQuery('')}>×</button>
        )}
      </div>
    </div>
  </div>
);

// School Card Component
const SchoolCard = ({ school, onClick }) => (
  <div className="card school-card" onClick={onClick}>
    <div className="card-image" style={{ backgroundImage: `url(${school.image})` }}>
      <div className="card-badge">{school.reviewCount} reviews</div>
    </div>
    <div className="card-content">
      <h3 className="card-title">{school.name}</h3>
      <p className="card-location">📍 {school.location}</p>
      <div className="card-rating">
        <StarRating rating={school.overallRating} />
        <span className="rating-value">{school.overallRating.toFixed(1)}</span>
      </div>
      <div className="quick-stats">
        <div className="stat">
          <span className="stat-icon">🎯</span>
          <span className="stat-value">{school.ratings.coachingQuality.toFixed(1)}</span>
          <span className="stat-label">Coaching</span>
        </div>
        <div className="stat">
          <span className="stat-icon">🔥</span>
          <span className="stat-value">{school.ratings.vibeFit.toFixed(1)}</span>
          <span className="stat-label">Vibe</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💰</span>
          <span className="stat-value">{school.ratings.cost.toFixed(1)}</span>
          <span className="stat-label">Value</span>
        </div>
      </div>
    </div>
  </div>
);

// Instructor Card Component
const InstructorCard = ({ instructor, onClick }) => (
  <div className="card instructor-card" onClick={onClick}>
    <div className="card-image" style={{ backgroundImage: `url(${instructor.image})` }}>
      <div className="card-badge belt-badge">{instructor.belt}</div>
    </div>
    <div className="card-content">
      <h3 className="card-title">{instructor.name}</h3>
      <p className="card-school">🏫 {instructor.schoolName}</p>
      <div className="dual-rating">
        <div className="rating-block">
          <span className="rating-label">Quality</span>
          <div className="rating-row">
            <StarRating rating={instructor.qualityRating} size="sm" />
            <span className="rating-value">{instructor.qualityRating.toFixed(1)}</span>
          </div>
        </div>
        <div className="rating-block">
          <span className="rating-label">Autism Level</span>
          <div className="rating-row">
            <AutismMeter level={instructor.autismLevel} size="sm" />
            <span className="rating-value">{instructor.autismLevel.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <div className="tags-preview">
        {instructor.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
        {instructor.tags.length > 3 && (
          <span className="tag more">+{instructor.tags.length - 3}</span>
        )}
      </div>
    </div>
  </div>
);

// School Detail View
const SchoolDetail = ({ school, onBack, instructors }) => {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratings, setRatings] = useState(
    schoolCriteria.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {})
  );
  const [comment, setComment] = useState('');
  
  const schoolInstructors = instructors.filter(i => i.schoolId === school.id);
  
  const handleSubmit = () => {
    alert('Rating submitted! In production, this would save to your database.');
    setShowRatingForm(false);
    setRatings(schoolCriteria.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {}));
    setComment('');
  };
  
  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>← Back to Schools</button>
      
      <div className="detail-header">
        <div className="detail-image" style={{ backgroundImage: `url(${school.image})` }} />
        <div className="detail-info">
          <h1 className="detail-title">{school.name}</h1>
          <p className="detail-location">📍 {school.location}</p>
          <div className="detail-rating">
            <StarRating rating={school.overallRating} size="lg" />
            <span className="rating-big">{school.overallRating.toFixed(1)}</span>
            <span className="review-count">({school.reviewCount} reviews)</span>
          </div>
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
          <button className="submit-btn" onClick={handleSubmit}>Submit Rating</button>
        </div>
      )}
      
      <div className="ratings-breakdown">
        <h2>Ratings Breakdown</h2>
        <div className="breakdown-grid">
          {schoolCriteria.map((criterion) => (
            <div key={criterion.key} className="breakdown-item">
              <div className="breakdown-header">
                <span>{criterion.icon} {criterion.label}</span>
                <span className="breakdown-value">{school.ratings[criterion.key].toFixed(1)}</span>
              </div>
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill" 
                  style={{ width: `${(school.ratings[criterion.key] / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {schoolInstructors.length > 0 && (
        <div className="school-instructors">
          <h2>Instructors at {school.name}</h2>
          <div className="cards-grid">
            {schoolInstructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} onClick={() => {}} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Instructor Detail View
const InstructorDetail = ({ instructor, onBack }) => {
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [quality, setQuality] = useState(0);
  const [autism, setAutism] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState('');
  
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : prev.length < 5 ? [...prev, tag] : prev
    );
  };
  
  const handleSubmit = () => {
    alert('Rating submitted! In production, this would save to your database.');
    setShowRatingForm(false);
    setQuality(0);
    setAutism(0);
    setSelectedTags([]);
    setComment('');
  };
  
  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>← Back to Instructors</button>
      
      <div className="detail-header instructor-header">
        <div className="detail-image round" style={{ backgroundImage: `url(${instructor.image})` }} />
        <div className="detail-info">
          <h1 className="detail-title">{instructor.name}</h1>
          <p className="detail-school">🏫 {instructor.schoolName}</p>
          <p className="detail-belt">{instructor.belt}</p>
          
          <div className="dual-rating-large">
            <div className="rating-block-large">
              <span className="rating-label">Quality</span>
              <div className="rating-row">
                <StarRating rating={instructor.qualityRating} size="lg" />
                <span className="rating-big">{instructor.qualityRating.toFixed(1)}</span>
              </div>
            </div>
            <div className="rating-block-large">
              <span className="rating-label">Autism Level</span>
              <div className="rating-row">
                <AutismMeter level={instructor.autismLevel} size="lg" />
                <span className="rating-big">{instructor.autismLevel.toFixed(1)}</span>
              </div>
            </div>
          </div>
          
          <div className="all-tags">
            {instructor.tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
          
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
              <label>Quality Rating</label>
              <p className="rating-desc">How good is this instructor at teaching?</p>
              <StarRating rating={quality} size="lg" interactive onChange={setQuality} />
            </div>
            
            <div className="rating-section">
              <label>Autism Level</label>
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
          
          <button className="submit-btn" onClick={handleSubmit}>Submit Rating</button>
        </div>
      )}
      
      <div className="reviews-section">
        <h2>Reviews ({instructor.reviewCount})</h2>
        <div className="reviews-list">
          {instructor.reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-ratings">
                  <div className="review-rating">
                    <span>Quality:</span>
                    <StarRating rating={review.quality} size="sm" />
                  </div>
                  <div className="review-rating">
                    <span>Autism:</span>
                    <AutismMeter level={review.autism} size="sm" />
                  </div>
                </div>
                <span className="review-date">{review.date}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-tags">
                {review.tags.map((tag, i) => (
                  <span key={i} className="tag small">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Home View
const HomeView = ({ setCurrentView, searchQuery, setSearchQuery, searchType, setSearchType, schools, instructors, setSelectedSchool, setSelectedInstructor }) => {
  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredInstructors = instructors.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.schoolName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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
          <div className="hero-stat">
            <span className="stat-number">{schools.reduce((a, s) => a + s.reviewCount, 0) + instructors.reduce((a, i) => a + i.reviewCount, 0)}</span>
            <span className="stat-text">Reviews</span>
          </div>
        </div>
      </div>
      
      {searchQuery ? (
        <div className="search-results">
          {showSchools && filteredSchools.length > 0 && (
            <section className="results-section">
              <h2>Schools ({filteredSchools.length})</h2>
              <div className="cards-grid">
                {filteredSchools.map((school) => (
                  <SchoolCard 
                    key={school.id} 
                    school={school} 
                    onClick={() => {
                      setSelectedSchool(school);
                      setCurrentView('school-detail');
                    }}
                  />
                ))}
              </div>
            </section>
          )}
          
          {showInstructors && filteredInstructors.length > 0 && (
            <section className="results-section">
              <h2>Instructors ({filteredInstructors.length})</h2>
              <div className="cards-grid">
                {filteredInstructors.map((instructor) => (
                  <InstructorCard 
                    key={instructor.id} 
                    instructor={instructor}
                    onClick={() => {
                      setSelectedInstructor(instructor);
                      setCurrentView('instructor-detail');
                    }}
                  />
                ))}
              </div>
            </section>
          )}
          
          {filteredSchools.length === 0 && filteredInstructors.length === 0 && (
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
              <h2>Top Rated Schools</h2>
              <button className="view-all" onClick={() => setCurrentView('schools')}>View All →</button>
            </div>
            <div className="cards-grid">
              {schools.slice(0, 3).map((school) => (
                <SchoolCard 
                  key={school.id} 
                  school={school}
                  onClick={() => {
                    setSelectedSchool(school);
                    setCurrentView('school-detail');
                  }}
                />
              ))}
            </div>
          </section>
          
          <section className="featured-section">
            <div className="section-header">
              <h2>Featured Instructors</h2>
              <button className="view-all" onClick={() => setCurrentView('instructors')}>View All →</button>
            </div>
            <div className="cards-grid">
              {instructors.slice(0, 3).map((instructor) => (
                <InstructorCard 
                  key={instructor.id} 
                  instructor={instructor}
                  onClick={() => {
                    setSelectedInstructor(instructor);
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
const SchoolsView = ({ schools, setSelectedSchool, setCurrentView }) => (
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
            setSelectedSchool(school);
            setCurrentView('school-detail');
          }}
        />
      ))}
    </div>
  </div>
);

// Instructors List View
const InstructorsView = ({ instructors, setSelectedInstructor, setCurrentView }) => (
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
            setSelectedInstructor(instructor);
            setCurrentView('instructor-detail');
          }}
        />
      ))}
    </div>
  </div>
);

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [schools] = useState(sampleSchools);
  const [instructors] = useState(sampleInstructors);
  
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
            schools={schools}
            instructors={instructors}
            setSelectedSchool={setSelectedSchool}
            setSelectedInstructor={setSelectedInstructor}
          />
        )}
        
        {currentView === 'schools' && (
          <SchoolsView 
            schools={schools}
            setSelectedSchool={setSelectedSchool}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'instructors' && (
          <InstructorsView 
            instructors={instructors}
            setSelectedInstructor={setSelectedInstructor}
            setCurrentView={setCurrentView}
          />
        )}
        
        {currentView === 'school-detail' && selectedSchool && (
          <SchoolDetail 
            school={selectedSchool}
            instructors={instructors}
            onBack={() => setCurrentView('schools')}
          />
        )}
        
        {currentView === 'instructor-detail' && selectedInstructor && (
          <InstructorDetail 
            instructor={selectedInstructor}
            onBack={() => setCurrentView('instructors')}
          />
        )}
      </main>
      
      <footer className="footer">
        <p>🥋 RateMyProfessorsAutism.com — Find your training home</p>
      </footer>
    </div>
  );
}
