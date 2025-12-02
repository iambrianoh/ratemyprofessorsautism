import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hppxhhnxbkufcuhikvel.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwcHhoaG54Ymt1ZmN1aGlrdmVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDM2MTgsImV4cCI6MjA4MDE3OTYxOH0.5iCVr6dy92ZfoBo7_Bz1BgqJovt1LbVl4V9NHpSZf_w'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// SCHOOLS
// ============================================

export async function getSchools() {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('name')
  
  if (error) {
    console.error('Error fetching schools:', error)
    return []
  }
  return data
}

export async function getSchoolById(schoolId) {
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

  // Calculate average ratings
  const avgRatings = calculateSchoolAverages(reviews || [])

  return { 
    ...school, 
    reviews: reviews || [], 
    avgRatings, 
    reviewCount: reviews?.length || 0 
  }
}

function calculateSchoolAverages(reviews) {
  if (!reviews || reviews.length === 0) return null
  
  const criteria = [
    'training_partner_quality', 'curriculum_quality', 'coaching_quality',
    'class_variety', 'schedule', 'cleanliness', 'cost', 'competition_support',
    'injury_management', 'vibe_fit', 'coach_availability', 'student_retention',
    'conflict_handling', 'inclusivity'
  ]
  
  const averages = {}
  let overallSum = 0
  let criteriaCount = 0
  
  criteria.forEach(c => {
    const values = reviews.map(r => r[c]).filter(v => v != null)
    if (values.length > 0) {
      averages[c] = values.reduce((a, b) => a + b, 0) / values.length
      overallSum += averages[c]
      criteriaCount++
    }
  })
  
  averages.overall = criteriaCount > 0 ? overallSum / criteriaCount : 0
  
  return averages
}

export async function submitSchoolReview(schoolId, ratings, comment) {
  const { data, error } = await supabase
    .from('school_reviews')
    .insert({
      school_id: schoolId,
      training_partner_quality: ratings.trainingPartnerQuality || null,
      curriculum_quality: ratings.curriculumQuality || null,
      coaching_quality: ratings.coachingQuality || null,
      class_variety: ratings.classVariety || null,
      schedule: ratings.schedule || null,
      cleanliness: ratings.cleanliness || null,
      cost: ratings.cost || null,
      competition_support: ratings.competitionSupport || null,
      injury_management: ratings.injuryManagement || null,
      vibe_fit: ratings.vibeFit || null,
      coach_availability: ratings.coachAvailability || null,
      student_retention: ratings.studentRetention || null,
      conflict_handling: ratings.conflictHandling || null,
      inclusivity: ratings.inclusivity || null,
      comment: comment
    })
    .select()
  
  if (error) {
    console.error('Error submitting review:', error)
    return { success: false, error }
  }
  return { success: true, data }
}

// ============================================
// INSTRUCTORS
// ============================================

export async function getInstructors() {
  const { data, error } = await supabase
    .from('instructors')
    .select(`
      *,
      schools (name, location)
    `)
    .order('name')
  
  if (error) {
    console.error('Error fetching instructors:', error)
    return []
  }
  
  return data.map(instructor => ({
    ...instructor,
    schoolName: instructor.schools?.name || 'Unknown School',
    schoolLocation: instructor.schools?.location || ''
  }))
}

export async function getInstructorById(instructorId) {
  const { data: instructor, error: instructorError } = await supabase
    .from('instructors')
    .select(`
      *,
      schools (name, location)
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

  // Calculate averages
  const avgQuality = reviews && reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.quality_rating, 0) / reviews.length 
    : 0
  const avgAutism = reviews && reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.autism_level, 0) / reviews.length 
    : 0

  // Get all tags from reviews
  const allTags = (reviews || []).flatMap(r => r.tags || [])
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
    schoolName: instructor.schools?.name || 'Unknown School',
    schoolLocation: instructor.schools?.location || '',
    reviews: reviews || [], 
    qualityRating: avgQuality,
    autismLevel: avgAutism,
    reviewCount: reviews?.length || 0,
    tags: topTags
  }
}

export async function submitInstructorReview(instructorId, quality, autism, tags, comment) {
  const { data, error } = await supabase
    .from('instructor_reviews')
    .insert({
      instructor_id: instructorId,
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

// ============================================
// SEARCH
// ============================================

export async function searchSchools(query) {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
    .order('name')
  
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
      schools (name, location)
    `)
    .ilike('name', `%${query}%`)
    .order('name')
  
  if (error) {
    console.error('Error searching instructors:', error)
    return []
  }
  
  return data.map(instructor => ({
    ...instructor,
    schoolName: instructor.schools?.name || 'Unknown School'
  }))
}
