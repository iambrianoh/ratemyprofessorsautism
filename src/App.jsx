import React, { useState, useEffect } from 'react';
import { 
  getSchools, 
  getInstructors, 
  getSchoolById, 
  getInstructorById,
  searchSchools,
  searchInstructors,
  submitSchoolReview,
  submitInstructorReview,
  submitSchoolSuggestion,
  submitInstructorSuggestion,
  reportReview
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

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }} onClick={onClose}>
      <div style={{
        background: '#141416',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255,255,255,0.1)'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none',
            border: 'none',
            color: '#888',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Submit School Modal
const SubmitSchoolModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name || !location) {
      alert('Please fill in school name and location');
      return;
    }
    setSubmitting(true);
    const result = await submitSchoolSuggestion(name, location, website, email);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setName('');
        setLocation('');
        setWebsite('');
        setEmail('');
      }, 2000);
    } else {
      alert('Error submitting. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#1a1a1e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="School Submitted!">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '4rem' }}>✅</span>
          <p style={{ marginTop: '1rem', color: '#888' }}>Thanks! We'll review and add it soon.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit a School">
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Don't see your school? Submit it and we'll add it to the database.
      </p>
      <input
        type="text"
        placeholder="School Name *"
        value={name}
        onChange={e => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="City, State (e.g., Los Angeles, CA) *"
        value={location}
        onChange={e => setLocation(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="Website (optional)"
        value={website}
        onChange={e => setWebsite(e.target.value)}
        style={inputStyle}
      />
      <input
        type="email"
        placeholder="Your Email (optional, for updates)"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #ff3d3d, #ff6b35)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {submitting ? 'Submitting...' : 'Submit School'}
      </button>
    </Modal>
  );
};

// Submit Instructor Modal
const SubmitInstructorModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [belt, setBelt] = useState('Black Belt');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!name || !schoolName) {
      alert('Please fill in instructor name and school');
      return;
    }
    setSubmitting(true);
    const result = await submitInstructorSuggestion(name, schoolName, belt, email);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setName('');
        setSchoolName('');
        setBelt('Black Belt');
        setEmail('');
      }, 2000);
    } else {
      alert('Error submitting. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#1a1a1e',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem'
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Instructor Submitted!">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '4rem' }}>✅</span>
          <p style={{ marginTop: '1rem', color: '#888' }}>Thanks! We'll review and add them soon.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Submit an Instructor">
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Don't see your instructor? Submit them and we'll add them to the database.
      </p>
      <input
        type="text"
        placeholder="Instructor Name *"
        value={name}
        onChange={e => setName(e.target.value)}
        style={inputStyle}
      />
      <input
        type="text"
        placeholder="School Name *"
        value={schoolName}
        onChange={e => setSchoolName(e.target.value)}
        style={inputStyle}
      />
      <select
        value={belt}
        onChange={e => setBelt(e.target.value)}
        style={{ ...inputStyle, cursor: 'pointer' }}
      >
        <option value="White Belt">White Belt</option>
        <option value="Blue Belt">Blue Belt</option>
        <option value="Purple Belt">Purple Belt</option>
        <option value="Brown Belt">Brown Belt</option>
        <option value="Black Belt">Black Belt</option>
        <option value="Red/Black Belt">Red/Black Belt</option>
        <option value="Red Belt">Red Belt</option>
      </select>
      <input
        type="email"
        placeholder="Your Email (optional, for updates)"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={inputStyle}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'linear-gradient(135deg, #ff3d3d, #ff6b35)',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Instructor'}
      </button>
    </Modal>
  );
};

// Report Modal
const ReportModal = ({ isOpen, onClose, reviewType, reviewId }) => {
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      alert('Please provide a reason for the report');
      return;
    }
    setSubmitting(true);
    const result = await reportReview(reviewType, reviewId, reason, email);
    setSubmitting(false);
    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setReason('');
        setEmail('');
      }, 2000);
    } else {
      alert('Error submitting report. Please try again.');
    }
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Report Submitted">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '4rem' }}>✅</span>
          <p style={{ marginTop: '1rem', color: '#888' }}>Thanks for helping keep our community safe.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Review">
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Report this review if it violates our guidelines (fake, offensive, or inappropriate content).
      </p>
      <select
        value={reason}
        onChange={e => setReason(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: '#1a1a1e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '1rem',
          marginBottom: '1rem',
          cursor: 'pointer'
        }}
      >
        <option value="">Select a reason...</option>
        <option value="fake">Fake or false review</option>
        <option value="offensive">Offensive or inappropriate language</option>
        <option value="spam">Spam or advertising</option>
        <option value="personal">Contains personal information</option>
        <option value="other">Other</option>
      </select>
      <input
        type="email"
        placeholder="Your Email (optional)"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: '#1a1a1e',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '1rem',
          marginBottom: '1rem'
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={submitting || !reason}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: reason ? 'linear-gradient(135deg, #ff3d3d, #ff6b35)' : '#333',
          border: 'none',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: reason ? 'pointer' : 'not-allowed'
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </Modal>
  );
};

// Terms of Service Page
const TermsPage = ({ onBack }) => (
  <div className="detail-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
    <button className="back-btn" onClick={onBack}>← Back</button>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Terms of Service</h1>
    
    <div style={{ color: '#ccc', lineHeight: 1.8 }}>
      <p style={{ marginBottom: '1rem' }}><strong>Last Updated:</strong> December 2025</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>1. Acceptance of Terms</h2>
      <p>By using RateMyProfessorsAutism.com ("the Site"), you agree to these Terms of Service.</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>2. User-Generated Content</h2>
      <p>• All reviews, ratings, and comments are submitted by users, not by RateMyProfessorsAutism.com</p>
      <p>• We do not verify, endorse, or guarantee the accuracy of any user-submitted content</p>
      <p>• Reviews represent the personal opinions of individual users only</p>
      <p>• We are not responsible for any user-submitted content</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>3. User Conduct</h2>
      <p>By submitting content, you agree that you will NOT post:</p>
      <p>• False statements presented as facts</p>
      <p>• Defamatory, libelous, or slanderous content</p>
      <p>• Content that violates any applicable law</p>
      <p>• Personal attacks or harassment</p>
      <p>• Confidential or private information about others</p>
      <p>• Spam, advertising, or promotional content</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>4. Review Guidelines</h2>
      <p>• Reviews must be based on genuine, first-hand experience</p>
      <p>• Reviews should be honest and fair</p>
      <p>• Focus on your experience at the school/with the instructor</p>
      <p>• Do not post reviews for schools/instructors you have not trained with</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>5. Content Removal</h2>
      <p>We reserve the right to remove any content that violates these Terms of Service or that we determine to be inappropriate.</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>6. Disclaimer of Warranties</h2>
      <p>THE SITE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY, COMPLETENESS, OR USEFULNESS OF ANY CONTENT.</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>7. Limitation of Liability</h2>
      <p>RATEMYPROFESSORSAUTISM.COM SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM USER-SUBMITTED CONTENT, YOUR RELIANCE ON ANY CONTENT, OR YOUR INTERACTIONS WITH ANY SCHOOL OR INSTRUCTOR LISTED.</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>8. Contact</h2>
      <p>Questions? Use the report feature on any review or reach out through our submission forms.</p>
    </div>
  </div>
);

// Privacy Policy Page
const PrivacyPage = ({ onBack }) => (
  <div className="detail-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
    <button className="back-btn" onClick={onBack}>← Back</button>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Privacy Policy</h1>
    
    <div style={{ color: '#ccc', lineHeight: 1.8 }}>
      <p style={{ marginBottom: '1rem' }}><strong>Last Updated:</strong> December 2025</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Information We Collect</h2>
      <p>• Reviews and ratings you submit</p>
      <p>• Email address (only if you choose to provide it)</p>
      <p>• Basic usage data (pages visited)</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>How We Use Information</h2>
      <p>• To display your reviews on the site</p>
      <p>• To contact you about submissions if you provide email</p>
      <p>• To improve the site</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Information Sharing</h2>
      <p>• We do not sell your personal information</p>
      <p>• Reviews are public and visible to all users</p>
      <p>• We may share information if required by law</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Your Rights</h2>
      <p>You may request deletion of your data by reporting your own review with a deletion request.</p>
    </div>
  </div>
);

// About/FAQ Page
const AboutPage = ({ onBack }) => (
  <div className="detail-view" style={{ maxWidth: '800px', margin: '0 auto' }}>
    <button className="back-btn" onClick={onBack}>← Back</button>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>About & FAQ</h1>
    
    <div style={{ color: '#ccc', lineHeight: 1.8 }}>
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>What is this site?</h2>
      <p>RateMyProfessorsAutism is a community-driven platform for rating and reviewing martial arts schools and instructors, primarily focused on Brazilian Jiu-Jitsu.</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>What does "Autism Level" mean?</h2>
      <p>It's a playful way to measure an instructor's obsessive dedication to the craft. A high "autism level" means they're deeply passionate, detail-oriented, and fully committed to jiu-jitsu. It's a compliment in the BJJ community!</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>School Rating Categories</h2>
      <div style={{ background: '#1a1a1e', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
        {schoolCriteria.map(c => (
          <p key={c.key} style={{ marginBottom: '0.5rem' }}>
            <span style={{ marginRight: '0.5rem' }}>{c.icon}</span>
            <strong>{c.label}</strong>
          </p>
        ))}
      </div>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>How do I add a school or instructor?</h2>
      <p>Click the "+ Add" button in the navigation to submit a school or instructor. We'll review and add it to the database.</p>
      
      <h2 style={{ fontSize: '1.3rem', marginTop: '2rem', marginBottom: '1rem', color: '#fff' }}>Are reviews verified?</h2>
      <p>No. Reviews are user-submitted opinions and are not verified. Please use your own judgment when reading reviews.</p>
    </div>
  </div>
);

// Header Component
const Header = ({ currentView, setCurrentView, setSearchQuery, setShowSubmitSchool, setShowSubmitInstructor }) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  return (
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
          <div style={{ position: 'relative' }}>
            <button 
              className="nav-btn cta"
              onClick={() => setShowAddMenu(!showAddMenu)}
            >
              + Add
            </button>
            {showAddMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#1a1a1e',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '0.5rem',
                marginTop: '0.5rem',
                minWidth: '150px',
                zIndex: 100
              }}>
                <button
                  onClick={() => { setShowSubmitSchool(true); setShowAddMenu(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseOver={e => e.target.style.background = '#252528'}
                  onMouseOut={e => e.target.style.background = 'none'}
                >
                  🏫 Add School
                </button>
                <button
                  onClick={() => { setShowSubmitInstructor(true); setShowAddMenu(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                  onMouseOver={e => e.target.style.background = '#252528'}
                  onMouseOut={e => e.target.style.background = 'none'}
                >
                  👤 Add Instructor
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

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
  const [reportingReview, setReportingReview] = useState(null);

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
      loadSchool();
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
          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ⚠️ By submitting, you confirm this review is based on your genuine experience and complies with our Terms of Service.
          </p>
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
                  <button
                    onClick={() => setReportingReview(review.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    🚩 Report
                  </button>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <ReportModal
        isOpen={reportingReview !== null}
        onClose={() => setReportingReview(null)}
        reviewType="school"
        reviewId={reportingReview}
      />
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
  const [reportingReview, setReportingReview] = useState(null);

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
          <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            ⚠️ By submitting, you confirm this review is based on your genuine experience and complies with our Terms of Service.
          </p>
          
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="review-date">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setReportingReview(review.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#666',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}
                    >
                      🚩 Report
                    </button>
                  </div>
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
      
      <ReportModal
        isOpen={reportingReview !== null}
        onClose={() => setReportingReview(null)}
        reviewType="instructor"
        reviewId={reportingReview}
      />
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

// Footer Component
const Footer = ({ setCurrentView }) => (
  <footer className="footer">
    <div style={{ marginBottom: '1rem' }}>
      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🥋</span>
      <span style={{ fontWeight: 600 }}>RateMyProfessorsAutism.com</span>
    </div>
    <p style={{ color: '#888', marginBottom: '1rem' }}>
      Find your perfect training ground
    </p>
    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <button 
        onClick={() => setCurrentView('about')}
        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
      >
        About / FAQ
      </button>
      <button 
        onClick={() => setCurrentView('terms')}
        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
      >
        Terms of Service
      </button>
      <button 
        onClick={() => setCurrentView('privacy')}
        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem' }}
      >
        Privacy Policy
      </button>
    </div>
    <p style={{ fontSize: '0.8rem', color: '#606068', maxWidth: '600px', margin: '0 auto' }}>
      ⚠️ Reviews are user-submitted opinions and do not represent the views of RateMyProfessorsAutism.com. 
      We do not verify or endorse any content. Use your own judgment.
    </p>
  </footer>
);

// Main App Component
export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [showSubmitSchool, setShowSubmitSchool] = useState(false);
  const [showSubmitInstructor, setShowSubmitInstructor] = useState(false);
  
  return (
    <div className="app">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        setSearchQuery={setSearchQuery}
        setShowSubmitSchool={setShowSubmitSchool}
        setShowSubmitInstructor={setShowSubmitInstructor}
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
        
        {currentView === 'terms' && (
          <TermsPage onBack={() => setCurrentView('home')} />
        )}
        
        {currentView === 'privacy' && (
          <PrivacyPage onBack={() => setCurrentView('home')} />
        )}
        
        {currentView === 'about' && (
          <AboutPage onBack={() => setCurrentView('home')} />
        )}
      </main>
      
      <Footer setCurrentView={setCurrentView} />
      
      <SubmitSchoolModal 
        isOpen={showSubmitSchool} 
        onClose={() => setShowSubmitSchool(false)} 
      />
      
      <SubmitInstructorModal 
        isOpen={showSubmitInstructor} 
        onClose={() => setShowSubmitInstructor(false)} 
      />
    </div>
  );
}
