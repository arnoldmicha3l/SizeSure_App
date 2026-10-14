# Requirements traceability

| Transaction | Frontend | Backend | Persistence | Evidence |
|---|---|---|---|---|
| Create Measurement Profile | `/profile/new`, `/profile/:id` | `/api/v1/profiles` | `measurement_profiles`, `body_measurements` | Validation, CRUD source |
| Compare Seller Size Chart | `/chart/new`, `/compare/:id/review` | `/api/v1/charts`, `/api/v1/comparisons` | `seller_charts`, `size_options`, `size_measurements`, `comparison_runs` | Unit conversion and matching source |
| Generate Size Recommendation | `/recommendation/:id` | `/api/v1/comparisons/{id}/recommendation` | No unapproved recommendations persisted | `RULES_UNAPPROVED` state |
