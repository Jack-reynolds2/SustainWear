'use server';

import { redirectUserByRole } from "@/features/auth/redirect";

export default async function GET() {
  await redirectUserByRole();
}
