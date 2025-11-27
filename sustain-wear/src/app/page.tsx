import { redirectUserByRole } from "@/features/auth/redirect";

export async function GET() {
  await redirectUserByRole();
}
