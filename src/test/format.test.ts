import { formatNorwegianCurrency } from "@/utils/format";

describe("formatNorwegianCurrency", () => {
  it("formats NOK values", () => {
    expect(formatNorwegianCurrency(2800)).toBe("2,800 NOK");
  });
});
