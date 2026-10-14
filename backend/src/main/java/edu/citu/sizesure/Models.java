package edu.citu.sizesure;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;
import java.math.BigDecimal;
class Models {
 @Entity @Table(name="measurement_profiles") public static class Profile {
  @Id public String id=UUID.randomUUID().toString(); public String label; public String category; public String fitPreference; public String preferredUnit;
  public Instant createdAt=Instant.now();public Instant updatedAt=Instant.now();
  @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="body_measurements",joinColumns=@JoinColumn(name="profile_id")) @MapKeyColumn(name="dimension_type") @Column(name="measurement_value",precision=16,scale=6) public Map<String,BigDecimal> measurements=new LinkedHashMap<>();
 }
 @Entity @Table(name="seller_charts") public static class Chart {
  @Id public String id=UUID.randomUUID().toString(); public String sellerName;public String garmentName;public String garmentCategory;public String measurementConvention;public String unit;
  public Instant createdAt=Instant.now();public Instant updatedAt=Instant.now();
  @OneToMany(cascade=CascadeType.ALL,orphanRemoval=true,fetch=FetchType.EAGER) @JoinColumn(name="chart_id") @OrderColumn(name="display_order") public List<SizeOption> sizes=new ArrayList<>();
 }
 @Entity @Table(name="size_options") public static class SizeOption {
  @Id public String id=UUID.randomUUID().toString(); public String label;
  @ElementCollection(fetch=FetchType.EAGER) @CollectionTable(name="size_measurements",joinColumns=@JoinColumn(name="size_id")) @MapKeyColumn(name="dimension_type") @Column(name="measurement_value",precision=16,scale=6) public Map<String,BigDecimal> measurements=new LinkedHashMap<>();
 }
 @Entity @Table(name="comparison_runs") public static class Comparison {
  @Id public String id=UUID.randomUUID().toString(); public String profileId;public String chartId;public Instant createdAt=Instant.now();
 }
}
