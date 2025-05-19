import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  showBackLink?: boolean;
  hideRegisterLink?: boolean;
  backLinkText?: string;
}

export default function Header({
  showBackLink = false,
  hideRegisterLink = false,
  backLinkText = "Back to Home",
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-500 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-3">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link
            href="/"
            className="flex items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-lg"
            aria-label="Go to Home"
            tabIndex={0}
          >
            <div className="relative h-8 sm:h-10 w-8 sm:w-10 bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
              <Image src="/logo.png" alt="NIEF SAYLANI Logo" fill className="object-cover" />
            </div>
            <span className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-teal-100">
              NIEF SAYLANI
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-4">
            {showBackLink && (
              <Link
                href="/"
                className="flex items-center gap-1 sm:gap-2 text-white hover:text-teal-100 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-300 rounded-lg px-2 py-1"
                aria-label={backLinkText}
                tabIndex={0}
              >
                <ArrowLeft size={14} className="sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">{backLinkText}</span>
              </Link>
            )}
            {!hideRegisterLink && (
              <Link
                href="/register"
                className="px-3 sm:px-4 md:px-6 py-2 bg-white text-teal-600 rounded-full font-medium hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-300"
                aria-label="Register"
                tabIndex={0}
              >
                Register
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
