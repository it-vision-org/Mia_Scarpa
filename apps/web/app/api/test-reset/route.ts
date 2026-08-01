import { NextResponse } from "next/server";
import { resetToDefault } from "@/actions/storeConfigActions";

export async function GET() {
  const result = await resetToDefault();
  return NextResponse.json(result);
}
