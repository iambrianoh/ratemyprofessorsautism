import { createClient } from '@supabase/supabase-js'

// ⚠️ REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
const supabaseUrl = 'https://YOUR-PROJECT-ID.supabase.co'
const supabaseKey = 'YOUR-ANON-KEY-HERE'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Helper functions to interact with the database

// SCHOOLS
export async function getSchools() {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching schools:', error)
    return []
  }
  return data
}

export async function getSchoolWithReviews(schoolId) {
  // Get school
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('id', schoolId)
    .single()
  
  if (schoolError) {
    console.error('Error fetching school:', schoolError)
    return null
  }

  // Get reviews for this school
  const { data: reviews, error: reviewsError } = await supabase
    .from('school_reviews')
    .select('*')
    .eq('school_id', schoolId)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
    return { ...school, reviews: [], avgRatings: null }
  }

  // Calculate average ratings
  const avgRatings = calculateSchoolAverages(reviews)

  return { ...school, reviews, avgRatings, reviewCount: reviews.length }
}

function calculateSchoolAverages(reviews) {
  if (reviews.length === 0) return null
  
  const criteria = [
    'training_partner_quality', 'curriculum_quality', 'coaching_quality',
    'class_variety', 'schedule', 'cleanliness', 'cost', 'competition_support',
    'injury_management', 'vibe_fit', 'coach_availability', 'student_retention',
    'conflict_handling', 'inclusivity'
  ]
  
  const totals = {}
  criteria.forEach(c => totals[c] = 0)
  
  reviews.forEach(review => {
    criteria.forEach(c => {
      if (review[c]) totals[c] += review[c]
    })
  })
  
  const averages = {}
  criteria.forEach(c => {
    averages[c] = totals[c] / reviews.length
  })
  
  // Overall average
  const overallSum = Object.values(averages).reduce((a, b) => a + b, 0)
  averages.overall = overallSum / criteria.length
  
  return averages
}

export async function submitSchoolReview(schoolId, ratings, comment, userEmail = null) {
  const { data, error } = await supabase
    .from('school_reviews')
    .insert({
      school_id: schoolId,
      user_email: userEmail,
      training_partner_quality: ratings.trainingPartnerQuality,
      curriculum_quality: ratings.curriculumQuality,
      coaching_quality: ratings.coachingQuality,
      class_variety: ratings.classVariety,
      schedule: ratings.schedule,
      cleanliness: ratings.cleanliness,
      cost: ratings.cost,
      competition_support: ratings.competitionSupport,
      injury_management: ratings.injuryManagement,
      vibe_fit: ratings.vibeFit,
      coach_availability: ratings.coachAvailability,
      student_retention: ratings.studentRetention,
      conflict_handling: ratings.conflictHandling,
      inclusivity: ratings.inclusivity,
      comment: comment
    })
    .select()
  
  if (error) {
    console.error('Error submitting review:', error)
    return { success: false, error }
  }
  return { success: true, data }
}

// INSTRUCTORS
export async function getInstructors() {
  const { data, error } = await supabase
    .from('instructors')
    .select(`
      *,
      schools (name)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching instructors:', error)
    return []
  }
  
  // Format the data to include school name directly
  return data.map(instructor => ({
    ...instructor,
    schoolName: instructor.schools?.name || 'Unknown School'
  }))
}

export async function getInstructorWithReviews(instructorId) {
  // Get instructor with school info
  const { data: instructor, error: instructorError } = await supabase
    .from('instructors')
    .select(`
      *,
      schools (name)
    `)
    .eq('id', instructorId)
    .single()
  
  if (instructorError) {
    console.error('Error fetching instructor:', instructorError)
    return null
  }

  // Get reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('instructor_reviews')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false })

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError)
    return { ...instructor, schoolName: instructor.schools?.name, reviews: [], avgRatings: null }
  }

  // Calculate averages
  const avgRatings = calculateInstructorAverages(reviews)
  
  // Get all tags from reviews
  const allTags = reviews.flatMap(r => r.tags || [])
  const tagCounts = {}
  allTags.forEach(tag => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1
  })
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag)

  return { 
    ...instructor, 
    schoolName: instructor.schools?.name,
    reviews, 
    avgRatings,
    reviewCount: reviews.length,
    topTags
  }
}

function calculateInstructorAverages(reviews) {
  if (reviews.length === 0) return { quality: 0, autism: 0 }
  
  const totalQuality = reviews.reduce((sum, r) => sum + (r.quality_rating || 0), 0)
  const totalAutism = reviews.reduce((sum, r) => sum + (r.autism_level || 0), 0)
  
  return {
    quality: totalQuality / reviews.length,
    autism: totalAutism / reviews.length
  }
}

export async function submitInstructorReview(instructorId, quality, autism, tags, comment, userEmail = null) {
  const { data, error } = await supabase
    .from('instructor_reviews')
    .insert({
      instructor_id: instructorId,
      user_email: userEmail,
      quality_rating: quality,
      autism_level: autism,
      tags: tags,
      comment: comment
    })
    .select()
  
  if (error) {
    console.error('Error submitting review:', error)
    return { success: false, error }
  }
  return { success: true, data }
}

// SEARCH
export async function searchSchools(query) {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
  
  if (error) {
    console.error('Error searching schools:', error)
    return []
  }
  return data
}

export async function searchInstructors(query) {
  const { data, error } = await supabase
    .from('instructors')
    .select(`
      *,
      schools (name)
    `)
    .or(`name.ilike.%${query}%`)
  
  if (error) {
    console.error('Error searching instructors:', error)
    return []
  }
  
  return data.map(instructor => ({
    ...instructor,
    schoolName: instructor.schools?.name || 'Unknown School'
  }))
}

// ADMIN FUNCTIONS (for adding schools/instructors)
export async function addSchool(name, location, imageUrl = null) {
  const { data, error } = await supabase
    .from('schools')
    .insert({ name, location, image_url: imageUrl })
    .select()
  
  if (error) {
    console.error('Error adding school:', error)
    return { success: false, error }
  }
  return { success: true, data: data[0] }
}

export async function addInstructor(name, schoolId, belt, imageUrl = null) {
  const { data, error } = await supabase
    .from('instructors')
    .insert({ name, school_id: schoolId, belt, image_url: imageUrl })
    .select()
  
  if (error) {
    console.error('Error adding instructor:', error)
    return { success: false, error }
  }
  return { success: true, data: data[0] }
}
