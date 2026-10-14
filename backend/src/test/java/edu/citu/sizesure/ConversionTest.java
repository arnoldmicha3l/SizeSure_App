package edu.citu.sizesure;
import org.junit.jupiter.api.Test;import java.math.BigDecimal;import static org.junit.jupiter.api.Assertions.*;
class ConversionTest { @Test void inchesToCm(){assertEquals(0,new BigDecimal("93.98").compareTo(Api.cm(new BigDecimal("37"),"IN")));assertEquals(0,new BigDecimal("2.54").compareTo(Api.cm(BigDecimal.ONE,"IN")));} @Test void cmUnchanged(){assertEquals(new BigDecimal("92"),Api.cm(new BigDecimal("92"),"CM"));} }
