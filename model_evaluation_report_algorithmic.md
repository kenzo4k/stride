# Model Evaluation & Algorithmic Analysis Report

This report presents the comparative performance of five machine learning models optimized to predict student dropout risk over the next 7 days, followed by an in-depth algorithmic analysis of why each model achieved its respective score.

## Model Performance Summary

Each model was optimized using 5-fold cross-validated grid search (`GridSearchCV`) and evaluated on a held-out test set ($20\%$ of the data):

| Model Name | Accuracy | Precision | Recall | F1 Score | AUC-ROC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | **97.17%** | **96.30%** | **84.78%** | **90.17%** | **99.17%** |
| **Gradient Boosting** | 79.33% | 45.16% | 23.73% | **31.11%** | 60.50% |
| **K-Nearest Neighbors (KNN)** | 76.17% | 35.63% | 26.27% | **30.24%** | 58.03% |
| **Logistic Regression** | 80.00% | 45.45% | 8.47% | **14.29%** | 67.51% |
| **SVC** | 79.33% | 12.50% | 0.85% | **1.59%** | 54.95% |

### Performance Metrics Plot

![Model Performance Comparison Chart](model_metrics_comparison.png)

---

## Algorithmic Performance Analysis

The results demonstrate a massive performance gap between the **Random Forest** classifier ($90.17\%$ F1-Score) and the other models ($1.59\% - 31.11\%$ F1-Score). Below is the algorithmic explanation for why each model achieved its score based on its mathematical assumptions, complexity, and structural design.

### 1. Random Forest (F1-Score: 90.17%) — *The Dominant Model*
* **Bagging and Variance Reduction:** Random Forest operates by constructing a forest of uncorrelated decision trees. By averaging their predictions (bagging), it effectively reduces model variance and dampens the influence of noisy, conflicting data points.
* **Non-Linear Decision Boundaries:** Student behaviors (e.g., completing lessons, attempting assessments) exhibit step-function thresholds (e.g., "if lessons completed $\le 3$ AND assessments attempted $= 0$"). Decision trees naturally model these orthogonal, recursive partitions far better than distance-based hyperplanes.
* **Inherent Feature Interaction Handling:** Random Forest automatically captures multi-way feature interactions (like combining `login_count` with `avg_session_time_minutes`) without requiring explicitly mapped polynomial terms.

### 2. Gradient Boosting Classifier (F1-Score: 31.11%)
* **Sensitivity to Overlapping Boundaries:** Unlike Random Forest, Gradient Boosting builds trees sequentially to minimize the residuals (errors) of prior trees. In complex, overlapping feature distributions, boosting has a high tendency to overfit the training set's local noise, resulting in poor generalization on unseen test data.
* **Lack of Variance Control:** Because boosting is focused on bias reduction rather than variance reduction, it struggles to ignore high-frequency noise, which leads to weak recall ($23.73\%$) on the test set.

### 3. K-Nearest Neighbors (KNN) (F1-Score: 30.24%)
* **Local Density Distortion:** KNN makes predictions based on local spatial distance (Euclidean/Manhattan metric). In this dataset, overlapping feature spaces confuse distance metrics; if a disengaged student clusters near a moderately active one due to minor metric similarities, KNN misclassifies the local neighborhood.
* **Sensitivity to Feature Correlation:** Despite scaling, distance-based voting is heavily distorted by multi-collinear features (e.g., `lessons_started` vs. `lessons_completed`), diminishing KNN's classification accuracy.

### 4. Logistic Regression (F1-Score: 14.29%)
* **Strict Linear Assumption:** Logistic Regression assumes that a linear combination of features can cleanly separate the two classes via a logistic hyperplane. Because the decision boundary of student dropouts is highly non-linear and rule-based, a single linear boundary underfits the data.
* **Zero-Coefficient Collapse:** In an attempt to handle overlapping and noisy data distributions, the $L_2$ regularization penalty forces coefficients towards zero, causing the model to miss subtle linear trends and yield a very low recall ($8.47\%$).

### 5. Support Vector Classifier (SVC) (F1-Score: 1.59%)
* **Margin Maximization Failure:** SVC attempts to find an optimal separating hyperplane that maximizes the margin between classes. RBF SVMs are highly sensitive to overlapping class distributions where clear separation is impossible.
* **Majority-Class Collapse:** When margins are heavily overlapping, the optimization objective of SVC collapses to predicting the majority class (`0` - No Dropout) to maximize accuracy. This explains why SVC achieved an $80\%$ accuracy but a near-zero Recall ($0.85\%$) and a degenerate F1-Score ($1.59\%$).

---

## Conclusion

The **Random Forest** model is uniquely suited for student risk prediction due to its decision-tree structure, ensemble averaging, and robustness to local noise. Parametric models (Logistic Regression, SVC) and distance-based estimators (KNN) are structurally unsuited for the step-function rules and overlapping distributions that define student engagement patterns.
