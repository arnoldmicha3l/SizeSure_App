package edu.citu.sizesure;
import org.springframework.data.jpa.repository.JpaRepository;
interface ProfileRepository extends JpaRepository<Models.Profile,String>{}
interface ChartRepository extends JpaRepository<Models.Chart,String>{}
interface ComparisonRepository extends JpaRepository<Models.Comparison,String>{}
