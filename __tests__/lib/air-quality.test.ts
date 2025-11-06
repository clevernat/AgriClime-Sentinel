import {
  getAQICategory,
  getHealthRecommendations,
} from "@/lib/api/air-quality";

describe("Air Quality Utilities", () => {
  describe("getAQICategory", () => {
    it("returns Good category for AQI 0-50", () => {
      const result = getAQICategory(0);
      expect(result.number).toBe(1);
      expect(result.name).toBe("Good");
      expect(result.color).toBe("#00E400");
    });

    it("returns Moderate category for AQI 51-100", () => {
      const result = getAQICategory(75);
      expect(result.number).toBe(2);
      expect(result.name).toBe("Moderate");
      expect(result.color).toBe("#F59E0B");
    });

    it("returns Unhealthy for Sensitive Groups for AQI 101-150", () => {
      const result = getAQICategory(125);
      expect(result.number).toBe(3);
      expect(result.name).toBe("Unhealthy for Sensitive Groups");
      expect(result.color).toBe("#FF7E00");
    });

    it("returns Unhealthy category for AQI 151-200", () => {
      const result = getAQICategory(175);
      expect(result.number).toBe(4);
      expect(result.name).toBe("Unhealthy");
      expect(result.color).toBe("#FF0000");
    });

    it("returns Very Unhealthy category for AQI 201-300", () => {
      const result = getAQICategory(250);
      expect(result.number).toBe(5);
      expect(result.name).toBe("Very Unhealthy");
      expect(result.color).toBe("#8F3F97");
    });

    it("returns Hazardous category for AQI > 300", () => {
      const result = getAQICategory(400);
      expect(result.number).toBe(6);
      expect(result.name).toBe("Hazardous");
      expect(result.color).toBe("#7E0023");
    });
  });

  describe("getHealthRecommendations", () => {
    it("returns appropriate recommendations for Good air quality", () => {
      const recommendations = getHealthRecommendations(25);
      expect(recommendations.general).toBe(
        "Air quality is good. Enjoy outdoor activities!"
      );
      expect(recommendations.sensitiveGroups).toBe(
        "No restrictions for sensitive groups."
      );
      expect(recommendations.activities).toBe(
        "All outdoor activities are safe."
      );
    });

    it("returns appropriate recommendations for Moderate air quality", () => {
      const recommendations = getHealthRecommendations(75);
      expect(recommendations.general).toBe(
        "Air quality is acceptable for most people."
      );
      expect(recommendations.sensitiveGroups).toContain(
        "Unusually sensitive people"
      );
      expect(recommendations.activities).toBe(
        "Most outdoor activities are safe."
      );
    });

    it("returns appropriate recommendations for Unhealthy for Sensitive Groups", () => {
      const recommendations = getHealthRecommendations(125);
      expect(recommendations.general).toContain("Sensitive groups");
      expect(recommendations.sensitiveGroups).toContain("limit prolonged");
      expect(recommendations.activities).toContain("Reduce prolonged");
    });

    it("returns appropriate recommendations for Unhealthy air quality", () => {
      const recommendations = getHealthRecommendations(175);
      expect(recommendations.general).toContain("Everyone");
      expect(recommendations.sensitiveGroups).toContain("avoid prolonged");
      expect(recommendations.activities).toContain("limit prolonged");
    });

    it("returns appropriate recommendations for Very Unhealthy air quality", () => {
      const recommendations = getHealthRecommendations(250);
      expect(recommendations.general).toContain("Health alert");
      expect(recommendations.sensitiveGroups).toContain("avoid all");
      expect(recommendations.activities).toContain("limit outdoor");
    });

    it("returns appropriate recommendations for Hazardous air quality", () => {
      const recommendations = getHealthRecommendations(400);
      expect(recommendations.general).toContain("Health warnings");
      expect(recommendations.sensitiveGroups).toContain("avoid all");
      expect(recommendations.activities).toBe("Avoid all outdoor activities.");
    });
  });
});
