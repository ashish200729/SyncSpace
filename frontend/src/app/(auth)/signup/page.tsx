import { redirect } from "next/navigation";
import { SignUpForm } from "../../../components/auth/SignUpForm";
import {
  DEFAULT_AUTH_REDIRECT_PATH,
  getSafeRedirectPath,
} from "../../../lib/callbackUrl";
import { getServerSession } from "../../../lib/serverSession";

type SignupPageProps = {
  searchParams?: Promise<{ callback?: string }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await getServerSession();
  const resolvedSearchParams = await searchParams;
  const callbackPath = getSafeRedirectPath(
    resolvedSearchParams?.callback,
    DEFAULT_AUTH_REDIRECT_PATH,
  );

  if (session) {
    redirect(callbackPath);
  }

  return <SignUpForm />;
}
