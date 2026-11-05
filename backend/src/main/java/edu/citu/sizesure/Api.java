
package edu.citu.sizesure;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.*;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;

import java.math.*;
import java.time.Instant;
import java.net.URI;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
class Api {

    private final ProfileRepository profiles;
    private final ChartRepository charts;
    private final ComparisonRepository comparisons;

    Api(ProfileRepository p, ChartRepository c, ComparisonRepository r) {
        profiles = p;
        charts = c;
        comparisons = r;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "SizeSure");
    }

    private static void valid(boolean ok, String message) {
        if (!ok) {
            throw new ResponseStatusException(
                    HttpStatus.UNPROCESSABLE_ENTITY, message
            );
        }
    }

    private static boolean text(String s) {
        return s != null && !s.isBlank() && s.length() <= 120;
    }

    private static boolean unit(String s) {
        return "CM".equals(s) || "IN".equals(s);
    }

    private static boolean dims(Map<String, BigDecimal> m) {
        return m != null && !m.isEmpty()
                && m.keySet().stream().allMatch(
                k -> Set.of("CHEST", "WAIST", "HIP").contains(k)
        )
                && m.values().stream().allMatch(
                v -> v != null && v.signum() > 0
        );
    }

    private static String accountId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "Sign in required"
            );
        }
        return auth.getName();
    }

    private static void requireRole(Authentication auth, String role) {
        accountId(auth);
        if (auth.getAuthorities().stream().noneMatch(
                a -> a.getAuthority().equals("ROLE_" + role))) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Account role not permitted"
            );
        }
    }

    private static void requireOwner(String ownerId, Authentication auth) {
        if (ownerId == null || !ownerId.equals(accountId(auth))) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Record not found"
            );
        }
    }

    private void check(Models.Profile p) {
        valid(text(p.label), "Profile label is required (max 120 characters)");
        valid(text(p.category), "Category is required");
        valid(p.fitPreference != null
                        && Set.of("FITTED", "REGULAR", "LOOSE")
                        .contains(p.fitPreference),
                "Select a fit preference");
        valid(unit(p.preferredUnit), "Choose CM or IN");
        valid(dims(p.measurements),
                "Enter positive chest, waist or hip measurements");
    }

    private void check(Models.Chart c) {
        valid(text(c.sellerName) && text(c.garmentName)
                        && text(c.garmentCategory),
                "Seller, garment and category are required");
        valid("CIRCUMFERENCE".equals(c.measurementConvention),
                "Only circumference charts are currently comparable");
        valid(unit(c.unit), "Choose CM or IN");
        valid(c.sizes != null && !c.sizes.isEmpty(),
                "Add at least one size");

        Set<String> labels = new HashSet<>();
        for (var s : c.sizes) {
            valid(s != null && text(s.label),
                    "Every size needs a label");
            valid(labels.add(s.label.trim().toLowerCase(Locale.ROOT)),
                    "Duplicate size label: " + s.label);
            valid(dims(s.measurements),
                    "Size " + s.label + " needs positive measurements");
        }
    }

    private Models.Profile profile(String id, Authentication auth) {
        requireRole(auth, "BUYER");
        var p = profiles.findById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Profile not found"
                )
        );
        requireOwner(p.ownerAccountId, auth);
        return p;
    }

    private Models.Chart chart(String id) {
        return charts.findById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Chart not found"
                )
        );
    }

    private Models.Chart ownedChart(String id, Authentication auth) {
        requireRole(auth, "SELLER");
        var c = chart(id);
        requireOwner(c.ownerAccountId, auth);
        return c;
    }

    private Models.Comparison comparison(String id, Authentication auth) {
        requireRole(auth, "BUYER");
        var c = comparisons.findById(id).orElseThrow(
                () -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Comparison not found"
                )
        );
        requireOwner(c.buyerAccountId, auth);
        return c;
    }

    // BUYER MEASUREMENT PROFILES

    @GetMapping("/profiles")
    public List<Models.Profile> listProfiles(Authentication auth) {
        requireRole(auth, "BUYER");
        return profiles.findAll().stream()
                .filter(p -> accountId(auth).equals(p.ownerAccountId))
                .toList();
    }

    @GetMapping("/profiles/{id}")
    public Models.Profile getProfile(
            @PathVariable String id, Authentication auth) {
        return profile(id, auth);
    }

    @PostMapping("/profiles")
    public ResponseEntity<Models.Profile> createProfile(
            @RequestBody Models.Profile body, Authentication auth) {
        requireRole(auth, "BUYER");
        check(body);

        body.id = UUID.randomUUID().toString();
        body.ownerAccountId = accountId(auth);
        body.createdAt = Instant.now();
        body.updatedAt = Instant.now();

        var saved = profiles.save(body);
        return ResponseEntity.created(
                URI.create("/api/v1/profiles/" + saved.id)
        ).body(saved);
    }

    @PutMapping("/profiles/{id}")
    public Models.Profile updateProfile(
            @PathVariable String id,
            @RequestBody Models.Profile body,
            Authentication auth) {
        var old = profile(id, auth);
        check(body);

        old.label = body.label;
        old.category = body.category;
        old.fitPreference = body.fitPreference;
        old.preferredUnit = body.preferredUnit;
        old.measurements = body.measurements;
        old.updatedAt = Instant.now();

        return profiles.save(old);
    }

    @DeleteMapping("/profiles/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProfile(
            @PathVariable String id, Authentication auth) {
        profile(id, auth);

        valid(comparisons.findAll().stream()
                        .noneMatch(c -> c.profileId.equals(id)),
                "Delete associated comparisons before deleting this profile");

        profiles.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // SELLER SIZE CHARTS

    @GetMapping("/charts")
    public List<Models.Chart> listCharts(Authentication auth) {
        accountId(auth);
        return charts.findAll().stream()
                .filter(c -> c.ownerAccountId != null)
                .toList();
    }

    @GetMapping("/charts/{id}")
    public Models.Chart getChart(
            @PathVariable String id, Authentication auth) {
        accountId(auth);
        var c = chart(id);
        if (c.ownerAccountId == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Chart not found"
            );
        }
        return c;
    }

    @PostMapping("/charts")
    public ResponseEntity<Models.Chart> createChart(
            @RequestBody Models.Chart body, Authentication auth) {
        requireRole(auth, "SELLER");
        check(body);

        body.id = UUID.randomUUID().toString();
        body.ownerAccountId = accountId(auth);
        body.createdAt = Instant.now();
        body.updatedAt = Instant.now();

        for (var s : body.sizes) {
            s.id = UUID.randomUUID().toString();
        }

        var saved = charts.save(body);
        return ResponseEntity.created(
                URI.create("/api/v1/charts/" + saved.id)
        ).body(saved);
    }

    @PutMapping("/charts/{id}")
    @Transactional
    public Models.Chart updateChart(
            @PathVariable String id,
            @RequestBody Models.Chart body,
            Authentication auth) {
        var old = ownedChart(id, auth);
        check(body);

        old.sellerName = body.sellerName;
        old.garmentName = body.garmentName;
        old.garmentCategory = body.garmentCategory;
        old.measurementConvention = body.measurementConvention;
        old.unit = body.unit;
        old.updatedAt = Instant.now();

        old.sizes.clear();
        for (var s : body.sizes) {
            s.id = UUID.randomUUID().toString();
            old.sizes.add(s);
        }

        return charts.save(old);
    }

    @DeleteMapping("/charts/{id}")
    @Transactional
    public ResponseEntity<Void> deleteChart(
            @PathVariable String id, Authentication auth) {
        ownedChart(id, auth);

        valid(comparisons.findAll().stream()
                        .noneMatch(c -> c.chartId.equals(id)),
                "Delete associated comparisons before deleting this chart");

        charts.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // BUYER COMPARISONS

    public record CompareRequest(String profileId, String chartId) {}

    @PostMapping("/comparisons")
    public ResponseEntity<Models.Comparison> compare(
            @RequestBody CompareRequest req, Authentication auth) {
        requireRole(auth, "BUYER");

        var p = profile(req.profileId(), auth);
        var c = getChart(req.chartId(), auth);

        valid("CIRCUMFERENCE".equals(c.measurementConvention),
                "Chart convention cannot be compared");

        boolean overlap = c.sizes.stream().anyMatch(
                s -> s.measurements.keySet().stream()
                        .anyMatch(p.measurements::containsKey)
        );
        valid(overlap, "No corresponding dimensions found");

        var run = new Models.Comparison();
        run.profileId = p.id;
        run.chartId = c.id;
        run.buyerAccountId = accountId(auth);

        var saved = comparisons.save(run);
        return ResponseEntity.created(
                URI.create("/api/v1/comparisons/" + saved.id)
        ).body(saved);
    }

    public record ComparisonSummary(
            String id, String profileId, String chartId,
            String profileLabel, String sellerName,
            String garmentName, Instant createdAt
    ) {}

    @GetMapping("/comparisons")
    public List<ComparisonSummary> listComparisons(Authentication auth) {
        requireRole(auth, "BUYER");

        return comparisons.findAll().stream()
                .filter(c -> accountId(auth).equals(c.buyerAccountId))
                .sorted(Comparator.comparing(
                        (Models.Comparison c) -> c.createdAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                ).reversed())
                .map(c -> new ComparisonSummary(
                        c.id, c.profileId, c.chartId,
                        profiles.findById(c.profileId)
                                .map(p -> p.label).orElse("Deleted profile"),
                        charts.findById(c.chartId)
                                .map(ch -> ch.sellerName).orElse("Deleted seller"),
                        charts.findById(c.chartId)
                                .map(ch -> ch.garmentName).orElse("Deleted garment"),
                        c.createdAt
                ))
                .toList();
    }

    @DeleteMapping("/comparisons/{id}")
    public ResponseEntity<Void> deleteComparison(
            @PathVariable String id, Authentication auth) {
        comparison(id, auth);
        comparisons.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/comparisons/{id}")
    public Map<String, Object> getComparison(
            @PathVariable String id, Authentication auth) {
        var run = comparison(id, auth);
        var p = profile(run.profileId, auth);
        var c = getChart(run.chartId, auth);

        List<Map<String, Object>> rows = new ArrayList<>();

        for (var size : c.sizes) {
            List<Map<String, Object>> evidence = new ArrayList<>();

            for (var entry : size.measurements.entrySet()) {
                var dim = entry.getKey();
                if (!p.measurements.containsKey(dim)) continue;

                var bodyCm = cm(
                        p.measurements.get(dim), p.preferredUnit
                );
                var garmentCm = cm(entry.getValue(), c.unit);

                evidence.add(Map.of(
                        "dimension", dim,
                        "bodyValue", p.measurements.get(dim),
                        "bodyUnit", p.preferredUnit,
                        "garmentValue", entry.getValue(),
                        "garmentUnit", c.unit,
                        "bodyCm", bodyCm,
                        "garmentCm", garmentCm,
                        "differenceCm", garmentCm.subtract(bodyCm)
                ));
            }

            rows.add(Map.of(
                    "sizeLabel", size.label,
                    "evidence", evidence
            ));
        }

        return Map.of(
                "id", run.id,
                "profile", p,
                "chart", c,
                "sizes", rows,
                "notice", "Differences are arithmetic evidence, not a fit verdict."
        );
    }

    static BigDecimal cm(BigDecimal v, String u) {
        return "IN".equals(u)
                ? v.multiply(new BigDecimal("2.54"))
                : v;
    }

    @PostMapping("/comparisons/{id}/recommendation")
    public Map<String, Object> recommend(
            @PathVariable String id, Authentication auth) {
        getComparison(id, auth);

        return Map.of(
                "status", "RULES_UNAPPROVED",
                "suggestedSize", "",
                "message",
                "Recommendation rules require team/professor approval. Measurement comparison evidence remains available.",
                "policyVersion", "NONE"
        );
    }

    @GetMapping("/rule-policies")
    public List<Object> policies(Authentication auth) {
        accountId(auth);
        return List.of();
    }
}

@Configuration
class CorsConfig implements WebMvcConfigurer {

    @Value("${CORS_ALLOWED_ORIGINS:http://localhost:5175,http://localhost:5180}")
    private String origins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(origins.split(","))
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}

@RestControllerAdvice
class ApiErrors {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> status(
            ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of(
                "code", "REQUEST_REJECTED",
                "message",
                e.getReason() == null ? "Request rejected" : e.getReason(),
                "fieldErrors", List.of(),
                "timestamp", Instant.now().toString()
        ));
    }

    @ExceptionHandler(
            org.springframework.http.converter.HttpMessageNotReadableException.class
    )
    public ResponseEntity<Map<String, Object>> malformed(Exception e) {
        return ResponseEntity.badRequest().body(Map.of(
                "code", "MALFORMED_REQUEST",
                "message",
                "Check numeric values, supported units and request structure.",
                "fieldErrors", List.of(),
                "timestamp", Instant.now().toString()
        ));
    }
}
