# REST API

Base: `http://localhost:8080/api/v1`

- `GET /health`
- `GET|POST /profiles`, `GET|PUT|DELETE /profiles/{id}`
- `GET|POST /charts`, `GET|PUT|DELETE /charts/{id}`
- `POST /comparisons`, `GET /comparisons/{id}`
- `POST /comparisons/{id}/recommendation`
- `GET /rule-policies`

Example profile POST:

```json
{"label":"Demo profile","category":"TOP","fitPreference":"REGULAR","preferredUnit":"CM","measurements":{"CHEST":92,"WAIST":76,"HIP":98}}
```

Example chart POST:

```json
{"sellerName":"Seller A (sample)","garmentName":"Everyday top","garmentCategory":"TOP","measurementConvention":"CIRCUMFERENCE","unit":"IN","sizes":[{"label":"M","measurements":{"CHEST":37,"WAIST":31}}]}
```

Comparison POST: `{"profileId":"<profile UUID>","chartId":"<chart UUID>"}`.

Recommendation endpoint currently returns `RULES_UNAPPROVED`; this is deliberate.
