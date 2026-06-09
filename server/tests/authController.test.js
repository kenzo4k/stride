import { test, mock } from 'node:test';
import assert from 'node:assert';
import { register, login } from '../controllers/authController.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

test('authController - registration and login unit tests', async (t) => {
  // Save original methods
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const originalCompare = bcrypt.compare;

  t.after(() => {
    // Restore original methods
    User.findOne = originalFindOne;
    User.create = originalCreate;
    bcrypt.compare = originalCompare;
  });

  await t.test('register should create a user and return JWT token', async () => {
    // Mock database check (user doesn't exist)
    User.findOne = async () => null;
    
    // Mock user creation
    User.create = async (userData) => {
      return {
        _id: 'mock_user_id',
        name: userData.name,
        email: userData.email,
        role: 'student',
        toObject: function() {
          return {
            _id: this._id,
            name: this.name,
            email: this.email,
            role: this.role
          };
        }
      };
    };

    const req = {
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      }
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

    await register(req, res);

    assert.strictEqual(statusCode, 201);
    assert.strictEqual(responseData.user.name, 'John Doe');
    assert.strictEqual(responseData.user.role, 'student');
    assert.ok(responseData.token);
  });

  await t.test('register should fail if user already exists', async () => {
    // Mock database check (user exists)
    User.findOne = async () => ({ email: 'existing@example.com' });

    const req = {
      body: {
        name: 'John Doe',
        email: 'existing@example.com',
        password: 'password123'
      }
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

    await register(req, res);

    assert.strictEqual(statusCode, 400);
    assert.strictEqual(responseData.message, 'User already exists');
  });

  await t.test('login should log in existing user with correct credentials', async () => {
    // Mock finding user
    User.findOne = async () => ({
      _id: 'mock_user_id',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      role: 'student',
      streakDays: 1,
      lastLogin: new Date(),
      save: async () => {},
      toObject: function() {
        return {
          _id: this._id,
          name: this.name,
          email: this.email,
          role: this.role
        };
      }
    });

    // Mock bcrypt compare to succeed
    bcrypt.compare = async () => true;

    const req = {
      body: {
        email: 'john@example.com',
        password: 'password123'
      }
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

    await login(req, res);

    assert.strictEqual(statusCode, 200);
    assert.strictEqual(responseData.user.email, 'john@example.com');
    assert.ok(responseData.token);
  });
});
