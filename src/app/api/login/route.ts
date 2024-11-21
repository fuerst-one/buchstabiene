import { checkCredentials } from "@/server/api/auth";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  console.log("POST /api/login", { email, password });

  const user = await checkCredentials(email, password);
  if (!user) {
    return new NextResponse(undefined, { status: 401 });
  }

  return NextResponse.json(user);
};
