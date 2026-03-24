import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { loadVaults } from "@/lib/vaults";
import { MOCK } from "@/lib/constants";

const getCachedVaults = unstable_cache(loadVaults, ["vaults"], { revalidate: 60 });

export async function GET() {
  try {
    const data = await getCachedVaults();
    return NextResponse.json({ ...data, source: "live" });
  } catch {
    return NextResponse.json({ vaults: MOCK, beraPrice: null, source: "mock" });
  }
}
