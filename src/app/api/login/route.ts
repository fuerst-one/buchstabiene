import { checkCredentials } from "@/server/api/auth";
import { NextResponse } from "next/server";

export const POST = async (request: Request) => {
  const { email, password } = await request.json();

  const user = await checkCredentials(email, password);
  if (!user) {
    return new NextResponse(undefined, { status: 401 });
  }

  return NextResponse.json(user);
};
