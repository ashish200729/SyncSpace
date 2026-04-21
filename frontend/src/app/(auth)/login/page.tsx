import { redirect } from "next/navigation";
import { SignInForm } from "../../../components/auth/SignInForm";
import {
  DEFAULT_AUTH_REDIRECT_PATH,
  getSafeRedirectPath,
} from "../../../lib/callbackUrl";
import { getServerSession } from "../../../lib/serverSession";

type LoginPageProps = {
  searchParams?: Promise<{ callback?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession();
  const resolvedSearchParams = await searchParams;
  const callbackPath = getSafeRedirectPath(
    resolvedSearchParams?.callback,
    DEFAULT_AUTH_REDIRECT_PATH,
  );

  if (session) {
    redirect(callbackPath);
  }

  return <SignInForm />;
}
