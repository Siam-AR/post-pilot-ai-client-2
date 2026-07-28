"use client";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import {
  Button,
  Card,
  Description,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { sanitizeRedirectPath } from "@/lib/auth-redirect";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (
            callback?: (notification: {
              isNotDisplayed?: () => boolean;
              isSkippedMoment?: () => boolean;
            }) => void,
          ) => void;
          renderButton: (
            container: HTMLElement,
            options: Record<string, string>,
          ) => void;
        };
      };
    };
  }
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    "";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [demoEmail, setDemoEmail] = useState("demo.user@postpilotai.com");
  const [demoPassword, setDemoPassword] = useState("demo.user@postpilotai.coM");
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const redirectTo = sanitizeRedirectPath(searchParams.get("redirectTo"));
  const getOriginLabel = () =>
    typeof window !== "undefined" ? window.location.origin : "this site";

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        setError("");
        setIsLoading(true);

        const base64Url = response.credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join(""),
        );

        const userData = JSON.parse(jsonPayload) as {
          name?: string;
          email?: string;
          picture?: string;
          sub?: string;
        };

        await googleLogin({
          name: userData.name,
          email: userData.email,
          image: userData.picture,
          googleId: userData.sub,
        });

        setSuccess("Google sign in successful! Redirecting...");
        showToast("Google login successful!", "success", 2000);

        window.setTimeout(() => {
          router.replace(redirectTo);
        }, 1500);
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Google sign in failed. Please try again.";
        setError(errorMsg);
        showToast(errorMsg, "error", 4000);
        setIsLoading(false);
      }
    },
    [googleLogin, showToast, router, redirectTo],
  );

  const handleGoogleSignIn = () => {
    if (!googleClientId) {
      setGoogleError(
        "Google sign-in is not configured for this deployment yet.",
      );
      return;
    }

    if (typeof window === "undefined" || !window.google?.accounts?.id) {
      setGoogleError(
        "Google sign-in is not available right now. Please refresh and try again.",
      );
      return;
    }

    try {
      setGoogleError("");
      const googleId = window.google?.accounts?.id;
      if (!googleId?.prompt) {
        setGoogleError(
          "Google sign-in is not available right now. Please refresh and try again.",
        );
        return;
      }
      googleId.prompt((notification) => {
        if (
          notification?.isNotDisplayed?.() ||
          notification?.isSkippedMoment?.()
        ) {
          setGoogleError(
            "Google sign-in prompt was not displayed. Please try again in a moment.",
          );
        }
      });
    } catch (err) {
      console.warn("Google sign-in prompt failed", err);
      setGoogleError("Google sign-in could not be started. Please try again.");
    }
  };

  useEffect(() => {
    if (!googleClientId || initializedRef.current) return;

    initializedRef.current = true;

    const initializeGoogle = () => {
      try {
        const googleAccounts = window.google?.accounts;
        const googleId = googleAccounts?.id;
        if (googleAccounts && googleId) {
          setGoogleError("");
          googleId.initialize({
            client_id: googleClientId,
            callback: handleGoogleResponse,
            ux_mode: "popup",
            auto_select: false,
          });

          try {
            const container = googleButtonRef.current;
            if (container) {
              googleId.renderButton(container, {
                type: "standard",
                theme: "outline",
                size: "large",
                text: "signin_with",
              });
            }
          } catch (err) {
            console.warn("Google renderButton failed", err);
            setGoogleError("Google sign-in button could not be rendered.");
          }
        }
      } catch (err) {
        setGoogleError(
          "Google sign-in failed to initialize. Check the client ID and authorized origins.",
        );
        console.warn("Google Sign-In initialization error", err);
      }
    };

    if (window.google?.accounts) {
      initializeGoogle();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogle, { once: true });
      if (existingScript.dataset.loaded === "true") {
        initializeGoogle();
      }
      return () => {
        existingScript.removeEventListener("load", initializeGoogle);
      };
    }

    const script = document.createElement("script");
    script.id = "google-gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        initializeGoogle();
      },
      { once: true },
    );
    document.body.appendChild(script);

    return () => {
      script.removeEventListener("load", initializeGoogle);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleResponse, googleClientId]);

  const fillDemoCredentials = async () => {
    setError("");
    setSuccess("");
    setDemoEmail("demo.user@postpilotai.com");
    setDemoPassword("demo.user@postpilotai.coM");

    const form = document.querySelector("form") as HTMLFormElement | null;
    if (form) {
      const emailInput = form.elements.namedItem(
        "email",
      ) as HTMLInputElement | null;
      const passwordInput = form.elements.namedItem(
        "password",
      ) as HTMLInputElement | null;

      if (emailInput) emailInput.value = "demo.user@postpilotai.com";
      if (passwordInput) passwordInput.value = "demo.user@postpilotai.coM";
    }

    try {
      await login({
        email: "demo.user@postpilotai.com",
        password: "demo.user@postpilotai.coM",
      });
      setSuccess("Demo sign in successful! Redirecting...");
      showToast("Demo login successful!", "success", 2000);

      window.setTimeout(() => {
        router.replace(redirectTo);
      }, 1500);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Demo sign in failed.";
      setError(errorMsg);
      showToast(errorMsg, "error", 4000);
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const form = e.currentTarget as HTMLFormElement & {
        email: { value: string };
        password: { value: string };
      };
      const email = form.email.value;
      const password = form.password.value;

      await login({ email, password });
      setSuccess("Sign in successful! Redirecting...");
      showToast("Login successful!", "success", 2000);

      window.setTimeout(() => {
        router.replace(redirectTo);
      }, 1500);
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Sign in failed. Please check your credentials and try again.";
      setError(errorMsg);
      showToast(errorMsg, "error", 4000);
      setIsLoading(false);
    }
  };

  return (
    <Card className="theme-section mx-auto mt-5 max-w-2xl px-4 py-8 md:px-8 md:py-10">
      <div>
        <h1 className="mb-2 text-center text-2xl font-bold md:text-3xl">
          Sign In to Post Pilot AI
        </h1>
        <p className="mb-6 text-center text-slate-600">
          AI-powered social media post generator
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        )}

        <Form
          className="flex w-full mx-auto flex-col gap-4"
          onSubmit={onSubmit}
        >
          <TextField
            isRequired
            name="email"
            type="email"
            validate={(value: string) => {
              if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
                return "Please enter a valid email address";
              }
              return null;
            }}
          >
            <Label>Email Address</Label>
            <Input
              placeholder="john@example.com"
              disabled={isLoading}
              className="w-full"
              suppressHydrationWarning
            />
            <FieldError />
          </TextField>

          <TextField
            isRequired
            minLength={6}
            name="password"
            type="password"
            validate={(value: string) => {
              if (value.length < 6) {
                return "Password must be at least 6 characters";
              }
              if (!/[A-Z]/.test(value)) {
                return "Password must contain at least one uppercase letter";
              }
              if (!/[a-z]/.test(value)) {
                return "Password must contain at least one lowercase letter";
              }
              return null;
            }}
          >
            <Label>Password</Label>
            <Input
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full"
              suppressHydrationWarning
            />
            <Description>
              Must be at least 6 characters with uppercase and lowercase letters
            </Description>
            <FieldError />
          </TextField>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="submit"
              className="theme-btn-primary w-full sm:w-1/2"
              isDisabled={isLoading}
            >
              {isLoading ? "LOGGING IN..." : "LOG IN"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-emerald-300 bg-emerald-50 text-emerald-700 sm:w-1/2"
              onPress={fillDemoCredentials}
              isDisabled={isLoading}
            >
              Demo Login
            </Button>
          </div>
        </Form>

        <div className="my-4 text-center text-slate-600">Or continue with</div>
        <div className="flex justify-center">
          <div ref={googleButtonRef} className="min-h-11" />
        </div>
        {googleError && (
          <div className="mt-3 text-center text-sm text-red-600">
            {googleError}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {"Don't have an account?"}
            <Link
              href={`/register${redirectTo !== "/" ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ""}`}
              className="ml-1 font-semibold text-(--brand-emerald) hover:text-(--brand-gold)"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto mt-8 max-w-2xl px-4 text-center text-sm text-slate-600">
          Loading sign in page...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
