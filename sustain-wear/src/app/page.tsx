import { redirectUserByRole } from "@/features/auth/redirect";

export default async function HomePage() {
  await redirectUserByRole();
}
