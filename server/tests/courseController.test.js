import { test } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { getAllCourses, getCourseById, updateCourse } from '../controllers/courseController.js';
import Course from '../models/Course.js';

test('courseController - unit tests', async (t) => {
  const originalFind = Course.find;
  const originalFindById = Course.findById;
  const originalFindByIdAndUpdate = Course.findByIdAndUpdate;

  t.after(() => {
    Course.find = originalFind;
    Course.findById = originalFindById;
    Course.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  await t.test('getAllCourses should return all active courses', async () => {
    const mockCourses = [
      { _id: 'c1', title: 'Course 1', status: 'active' },
      { _id: 'c2', title: 'Course 2', status: 'published' }
    ];
    Course.find = async () => mockCourses;

    const req = {};
    let responseData = null;
    const res = {
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await getAllCourses(req, res);

    assert.deepStrictEqual(responseData, mockCourses);
  });

  await t.test('getCourseById should return 400 for invalid ObjectId format', async () => {
    const req = { params: { id: 'invalid-id' } };
    let statusCode = null;
    let responseData = null;
    const res = {
      status: function(code) {
        statusCode = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await getCourseById(req, res);

    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.message, 'Invalid course ID format');
  });

  await t.test('getCourseById should return 404 if course not found', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    Course.findById = async () => null;

    const req = { params: { id: validId } };
    let statusCode = null;
    let responseData = null;
    const res = {
      status: function(code) {
        statusCode = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await getCourseById(req, res);

    assert.strictEqual(statusCode, 404);
    assert.strictEqual(responseData.message, 'Course not found');
  });

  await t.test('updateCourse should return 403 if instructor is not the owner', async () => {
    const courseId = new mongoose.Types.ObjectId().toString();
    const instructorId = new mongoose.Types.ObjectId().toString();
    const anotherInstructorId = new mongoose.Types.ObjectId().toString();

    // Mock finding the course with instructorId
    Course.findById = async () => ({
      _id: courseId,
      instructorId: instructorId,
      instructor: { email: 'owner@example.com' }
    });

    const req = {
      params: { id: courseId },
      user: {
        id: anotherInstructorId,
        email: 'attacker@example.com',
        role: 'instructor'
      },
      body: { title: 'Hacked Title' }
    };

    let statusCode = null;
    let responseData = null;
    const res = {
      status: function(code) {
        statusCode = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    await updateCourse(req, res);

    assert.strictEqual(statusCode, 403);
    assert.match(responseData.message, /Not authorized to update this course/);
  });
});
