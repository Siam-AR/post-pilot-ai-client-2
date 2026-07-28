"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Avatar,
  Button,
  Dropdown,
  Label,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdDarkMode, MdLightMode, MdLogout, MdPerson } from "react-icons/md";
import { useTheme } from "@/lib/theme-context";
import type { User } from "@/types";

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleSignOut = () => {
    logout();
  };

  const isActive = (href: string) => pathname === href;

  const navLinkClass = (active: boolean) =>
    `font-medium transition-all ${
      active
        ? "text-white"
        : isDarkMode
          ? "text-blue-100/90 hover:text-white"
          : "text-blue-100/90 hover:text-white"
    }`;

  const themeButtonClass = isDarkMode
    ? "bg-white/10 text-white hover:bg-white/20"
    : "bg-white/15 text-white hover:bg-white/25";

  return (
    <div className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#090e15]/95 py-2 shadow-[0_10px_30px_rgba(0,0,0,.2)] backdrop-blur-xl md:py-3">
      <nav className="mx-auto flex h-14 max-w-[118rem] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-lg font-bold tracking-tight text-white sm:text-2xl"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl">
            <img
              src="/post-pilot-ai-logo.png"
              alt="Post Pilot AI logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="truncate">Post Pilot AI</span>
        </Link>

        <ul className="hidden items-center gap-8 font-serif text-[1.05rem] md:flex">
          <li>
            <Link href="/" className={navLinkClass(isActive("/"))}>
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/features"
              className={navLinkClass(isActive("/features"))}
            >
              Features
            </Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link
                  href="/generate-post"
                  className={navLinkClass(isActive("/generate-post"))}
                >
                  Generate Post
                </Link>
              </li>
              <li>
                <Link
                  href="/my-posts"
                  className={navLinkClass(isActive("/my-posts"))}
                >
                  My Posts
                </Link>
              </li>
            </>
          )}
          <li>
            <Link href="/about" className={navLinkClass(isActive("/about"))}>
              About
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className={navLinkClass(isActive("/contact"))}
            >
              Contact
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2 md:gap-3">
          {isAuthenticated && user ? (
            <Dropdown>
              <DropdownTrigger>
                <div className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-2 py-2 shadow-sm md:px-3">
                  <Avatar className="transition-transform" size="sm">
                    <Avatar.Image
                      referrerPolicy="no-referrer"
                      alt={user?.name || "User"}
                      src={user?.image}
                    />
                    <Avatar.Fallback>
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium text-white sm:inline">
                    {user?.name}
                  </span>
                </div>
              </DropdownTrigger>
              <Dropdown.Popover>
                <div className="px-3 pb-1 pt-3">
                  <div className="flex items-center gap-2">
                    <Avatar size="sm">
                      <Avatar.Image
                        referrerPolicy="no-referrer"
                        alt={user?.name || "User"}
                        src={user?.image}
                      />
                      <Avatar.Fallback delayMs={600}>
                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </Avatar.Fallback>
                    </Avatar>
                    <div className="flex flex-col gap-0">
                      <p className="text-sm font-medium leading-5">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-slate-500">
                        {(user as User | null)?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <Dropdown.Menu aria-label="User Actions">
                  <DropdownItem
                    key="profile"
                    textValue="Profile"
                    href="/profile"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Label>Profile</Label>
                      <MdPerson className="size-3.5 text-slate-500" />
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    textValue="Logout"
                    variant="danger"
                    onClick={handleSignOut}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Label>Logout</Label>
                      <MdLogout className="size-3.5 text-danger" />
                    </div>
                  </DropdownItem>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-serif text-base text-slate-200 hover:bg-white/5 hover:text-white"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="rounded-xl bg-[linear-gradient(100deg,#5067f5,#a144ef)] px-5 py-2.5 font-serif text-base font-bold text-white shadow-[0_8px_22px_rgba(100,83,241,.26)] transition-transform hover:scale-[1.02]"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors md:hidden ${themeButtonClass}`}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <span className="text-xl">☰</span>
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-screen w-[84%] max-w-[320px] flex-col border-l border-white/10 bg-slate-950 p-4 shadow-[0_20px_80px_rgba(2,6,23,0.7)]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/10 p-1">
                  <img
                    src="/logo.svg"
                    alt="Post Pilot AI logo"
                    className="h-7 w-7 rounded-lg object-cover"
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  Post Pilot AI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white"
                aria-label="Close navigation menu"
              >
                ✕
              </button>
            </div>

            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/features"
                  className="flex rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10 hover:text-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              {isAuthenticated && (
                <>
                  <li>
                    <Link
                      href="/generate-post"
                      className="flex rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Generate Post
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/my-posts"
                      className="flex rounded-xl px-3 py-3 text-blue-100 hover:bg-white/10 hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Posts
                    </Link>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-4 border-t border-white/10 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/generate-post"
                    className="rounded-xl bg-white/10 px-3 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Generate Post
                  </Link>
                  <Link
                    href="/my-posts"
                    className="rounded-xl bg-white/10 px-3 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Posts
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="rounded-xl border border-white/15 px-3 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-xl bg-blue-600 px-3 py-3 text-center text-sm font-semibold text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
