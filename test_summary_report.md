# Stride - Testing & Verification Summary Report

**Date**: June 9, 2026  
**Status**: Passed (22/22 Tests successful)  
**Testing Frameworks**: Node.js v24 Native Test Runner (`node:test`), Python `unittest` Standard Library.

---

## 1. Node.js Express Backend Tests (15 Tests)

All backend controller and middleware tests run in isolation using mocked mongoose models.

| Controller File | Test Cases Covered | Result |
| :--- | :--- | :--- |
| **`authController`** | - User registration: checks payload validation & password hashing triggers.<br>- User login: checks password hashing verification and JWT generation.<br>- Duplicity control: rejects existing email addresses. | **Passed** |
| **`courseController`** | - Course retrieval: fetches active/published listings.<br>- Query validation: returns 400 for bad course ObjectIds.<br>- CMS Ownership Enforcement: blocks instructors from editing courses they do not own. | **Passed** |
| **`assessmentController`** | - Sanitize Quiz: strips correct answers before sending to clients.<br>- Auto-grader: checks MCQ, True/False, and Concept-matching grading math.<br>- XP Progression: awards XP corresponding to the achieved grade. | **Passed** |
| **`codeEvaluationController`** | - Payload integrity: checks language limits (Python only).<br>- Sandbox flow: executes code in Vercel Sandbox.<br>- Fallback Sandbox: verifies code compiles and runs locally in a python subprocess. | **Passed** |

---

## 2. Python Recommender Service Unit Tests (6 Tests)

Verifies the hybrid course discovery layers in isolation by mocking MongoDB database boundaries.

| Component | Test Case | Target Metric | Result |
| :--- | :--- | :--- | :--- |
| **Layer 1: Content Similarity** | Cosine similarity scores on TF-IDF metadata. | Similarity score > 0.0 & tracks source ID. | **Passed** |
| **Layer 2: Collaborative Filtering** | Jaccard similarity matrices on peer enrollments. | Boosts mutual interest matches. | **Passed** |
| **Layer 3: Prerequisite Engine** | Case-insensitive & trimmed title comparisons. | Prerequisite matched successfully. | **Passed** |
| **Layer 3: Deadlock Protection** | Bypasses progression locks when lower-level courses are missing. | Custom category course recommendations. | **Passed** |
| **Layer 4: Ranking & Explainability** | Priority weighting and dynamic explainability `reason` generation. | Generates *"Similar to..."* & *"Building on..."*. | **Passed** |

---

## 3. Python Student Dropout Prediction Tests (1 Test)

Evaluates the feature engineering pipeline and classifier pipeline thresholds.

| Component | Test Case | Target Metric | Result |
| :--- | :--- | :--- | :--- |
| **`DropoutPredictor`** | Feeds all 12 behavior metrics into the Scikit-Learn pipeline. | Correctly outputs high, medium, low risk levels. | **Passed** |

---

## 4. Execution Commands

To execute the test suites on your system:

```bash
# Express API Controllers
node --test server/tests/authController.test.js server/tests/courseController.test.js server/tests/assessmentController.test.js server/tests/codeEvaluationController.test.js

# Python Course Recommender Logic
server/recommender_service/venv/Scripts/python -m unittest server/recommender_service/tests/test_recommender_logic.py

# Python Student Dropout Logic
server/recommender_service/venv/Scripts/python -m unittest server/dropout_service/tests/test_dropout_service.py
```
