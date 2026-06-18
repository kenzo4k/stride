/* global process */
import axios from 'axios';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

export const getRecommendations = async (req, res) => {
  const { category, courseId } = req.query;

  // If courseId is provided, we are fetching similar courses for a course detail page.
  // We want to return courses in the same category rather than user-based personalized recommendations.
  if (courseId) {
    try {
      const targetId = mongoose.Types.ObjectId.isValid(courseId)
        ? new mongoose.Types.ObjectId(courseId)
        : courseId;

      const targetCourse = await Course.findById(targetId);
      if (!targetCourse) {
        return res.status(404).json({ message: "Course not found" });
      }

      const targetCategory = targetCourse.category;
      const tags = targetCourse.tags || [];

      // Query similar courses by matching category (case-insensitive) OR sharing any tags
      const query = {
        status: { $in: ['active', 'published'] },
        _id: { $ne: targetId },
        $or: []
      };

      if (targetCategory) {
        query.$or.push({ category: { $regex: targetCategory, $options: 'i' } });
      }
      if (tags.length > 0) {
        query.$or.push({ tags: { $in: tags } });
      }

      if (query.$or.length === 0) {
        delete query.$or;
      }

      let courses = await Course.find(query).limit(4);
      if (courses.length === 0) {
        // Fallback to popular and fresh courses if no matching similarity exists
        courses = await Course.find({ 
          status: { $in: ['active', 'published'] }, 
          _id: { $ne: targetId } 
        })
        .sort({ enrollmentCount: -1, createdAt: -1 })
        .limit(4);
      }
      const recommendations = courses.map(c => {
        let reason = "Related course";
        if (targetCategory && c.category === targetCategory) {
          reason = `Similar course in ${targetCategory}`;
        } else if (tags.some(t => c.tags && c.tags.includes(t))) {
          reason = "Related by tags";
        }
        return {
          ...c.toObject(),
          reason
        };
      });
      return res.status(200).json({ recommendations });
    } catch (dbError) {
      return res.status(500).json({ message: "Failed to get similar courses", error: dbError.message });
    }
  }

  // Otherwise, fetch user-based personalized recommendations from Python microservice
  try {
    const userId = req.user.id;
    console.log("Recommender request for userId:", userId);
    const pythonServiceUrl = process.env.RECOMMENDER_SERVICE_URL || 'http://localhost:8000';
    // Call Python microservice
    const response = await axios.get(`${pythonServiceUrl}/api/recommendations/${userId}`);
    res.status(200).json(response.data);
  } catch {
    console.warn("Python service unreachable, falling back to database query recommendation...");
    try {
      const userId = req.user.id;
      const userEnrollments = await Enrollment.find({ userId }).populate('courseId');
      
      const enrolledCourseIds = new Set(userEnrollments.map(e => e.courseId ? e.courseId._id.toString() : null).filter(Boolean));
      const enrolledCategories = new Set(userEnrollments.map(e => e.courseId ? e.courseId.category : null).filter(Boolean));
      
      if (category) {
        const dbCourses = await Course.find({
          status: { $in: ['active', 'published'] },
          category,
          _id: { $nin: Array.from(enrolledCourseIds).map(id => new mongoose.Types.ObjectId(id)) }
        })
        .sort({ enrollmentCount: -1, rating: -1 })
        .limit(4);
        
        const recommendations = dbCourses.map(c => ({
          ...c.toObject(),
          reason: `Popular in ${category}`
        }));
        return res.status(200).json({ recommendations });
      }

      // Track completed/active levels per category for progression check
      const categoryLevels = {};
      userEnrollments.forEach(e => {
        if (e.courseId && e.courseId.category) {
          const cat = e.courseId.category;
          const lvl = e.courseId.level || 'Beginner';
          if (!categoryLevels[cat]) {
            categoryLevels[cat] = new Set();
          }
          categoryLevels[cat].add(lvl);
        }
      });

      const query = { 
        status: { $in: ['active', 'published'] },
        _id: { $nin: Array.from(enrolledCourseIds).map(id => new mongoose.Types.ObjectId(id)) }
      };
      
      const candidateCourses = await Course.find(query);
      const selected = [];
      const selectedIds = new Set();

      function addCourse(course, reason) {
        const cid = course._id.toString();
        if (!selectedIds.has(cid)) {
          selected.push({
            ...course.toObject(),
            reason
          });
          selectedIds.add(cid);
          return true;
        }
        return false;
      }

      // Sort candidates by a hybrid popularity score (enrollment + rating)
      const sortedCandidates = [...candidateCourses].sort((a, b) => {
        const popA = (a.enrollmentCount || 0) * 0.5 + (a.rating || 0) * 0.5;
        const popB = (b.enrollmentCount || 0) * 0.5 + (b.rating || 0) * 0.5;
        return popB - popA;
      });

      // 1. Progression Course
      let progressionCourse = null;
      for (const cat of enrolledCategories) {
        const completed = categoryLevels[cat] || new Set();
        let targetLevel = null;
        if (!completed.has('Beginner')) {
          targetLevel = 'Beginner';
        } else if (!completed.has('Intermediate')) {
          targetLevel = 'Intermediate';
        } else if (!completed.has('Advanced')) {
          targetLevel = 'Advanced';
        }
        
        if (targetLevel) {
          const match = sortedCandidates.find(c => c.category === cat && c.level === targetLevel);
          if (match) {
            progressionCourse = match;
            break;
          }
        }
      }
      if (progressionCourse) {
        addCourse(progressionCourse, `Next level in your ${progressionCourse.category} learning path`);
      }

      // 2. Collaborative Course
      let collabCourse = null;
      if (enrolledCourseIds.size > 0) {
        const otherEnrollments = await Enrollment.find({
          courseId: { $in: Array.from(enrolledCourseIds).map(id => new mongoose.Types.ObjectId(id)) },
          userId: { $ne: new mongoose.Types.ObjectId(userId) }
        });
        const otherUserIds = Array.from(new Set(otherEnrollments.map(e => e.userId.toString())));
        
        if (otherUserIds.length > 0) {
          const neighborEnrollments = await Enrollment.find({
            userId: { $in: otherUserIds.map(id => new mongoose.Types.ObjectId(id)) },
            courseId: { $nin: Array.from(enrolledCourseIds).map(id => new mongoose.Types.ObjectId(id)) }
          });
          const counts = {};
          neighborEnrollments.forEach(ne => {
            if (ne.courseId) {
              const cid = ne.courseId.toString();
              counts[cid] = (counts[cid] || 0) + 1;
            }
          });
          const sortedCollabIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
          for (const cid of sortedCollabIds) {
            const match = candidateCourses.find(c => c._id.toString() === cid);
            if (match) {
              collabCourse = match;
              break;
            }
          }
        }
      }
      if (collabCourse) {
        addCourse(collabCourse, "Highly rated by students with similar profiles");
      }

      // 3. Hot Course
      const hotCourse = sortedCandidates.find(c => !selectedIds.has(c._id.toString()));
      if (hotCourse) {
        addCourse(hotCourse, `Trending course in ${hotCourse.category}`);
      }

      // 4. Content / Category Interest Course
      const interestCourse = sortedCandidates.find(c => 
        enrolledCategories.has(c.category) && !selectedIds.has(c._id.toString())
      );
      if (interestCourse) {
        addCourse(interestCourse, `Based on your interest in ${interestCourse.category}`);
      }

      // Fill remaining slots
      for (const c of sortedCandidates) {
        if (selected.length >= 4) break;
        addCourse(c, `Popular introductory course in ${c.category}`);
      }

      res.status(200).json({ recommendations: selected });
    } catch (dbError) {
      res.status(500).json({ message: "Failed to get recommendations", error: dbError.message });
    }
  }
};
