import { redirect } from "next/navigation";
import { SignUpForm } from "../../../components/auth/SignUpForm";
import {
  DEFAULT_AUTH_REDIRECT_PATH,
  getSafeRedirectPath,
} from "../../../lib/callback-url";
import { getServerSession } from "../../../lib/server-session";

type SignupPageProps = {
  searchParams?: {
    callback?: string;
  };
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const session = await getServerSession();
  const callbackPath = getSafeRedirectPath(
    searchParams?.callback,
    DEFAULT_AUTH_REDIRECT_PATH,
  );

  if (session) {
    redirect(callbackPath);
  }

  return <SignUpForm />;
}
