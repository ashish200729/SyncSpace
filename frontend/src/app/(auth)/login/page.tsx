import { redirect } from "next/navigation";
import { SignInForm } from "../../../components/auth/SignInForm";
import {
  DEFAULT_AUTH_REDIRECT_PATH,
  getSafeRedirectPath,
} from "../../../lib/callback-url";
import { getServerSession } from "../../../lib/server-session";

type LoginPageProps = {
  searchParams?: {
    callback?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession();
  const callbackPath = getSafeRedirectPath(
    searchParams?.callback,
    DEFAULT_AUTH_REDIRECT_PATH,
  );

  if (session) {
    redirect(callbackPath);
  }

  return <SignInForm />;
}
