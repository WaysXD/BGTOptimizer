export async function maybeHedge({ enabled, fill, pair }) {
  if (!enabled || !pair.hedgeEnabled) return { status: "unhedged", reason: "disabled" };
  // Placeholder for provider abstraction: implement Kyber Aggregator hedge in dedicated service when live mode is enabled.
  return { status: "skipped", reason: "hedge-provider-not-configured", fillId: fill.id };
}
