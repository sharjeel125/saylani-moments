import Image from "next/image";
import Link from "next/link";
import { PartnerScroll } from "../components/partner-scroll";
import Header from "../components/header";
import { galleryImages } from "../data/image";
import type { StaticImageData } from "next/image";

export interface GalleryImage {
  id: number;
  src: string | StaticImageData; // allow both
  alt: string;
  title: string;
  description?: string;
}

const Home: React.FC = () => {
  const previewImages: GalleryImage[] = galleryImages.slice(0, 7);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section with gradient */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-teal-50 to-white">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-teal-700/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-16 md:mt-16">
            <h1 className="text-5xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-teal-800 via-teal-600 to-emerald-500 leading-tight">
              Instantly Find Every Photo You're In
            </h1>
            <p className="text-xl md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload your selfie to get all the photos the photographer captured
              of you — delivered effortlessly in seconds.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="relative mt-28 sm:mx-5">
            <div className="absolute -inset-2 bg-gradient-to-r from-teal-100 to-emerald-100 rounded-3xl blur-sm opacity-75"></div>
            <div className="relative h-[400px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl w-full">
              <Image
                src="/bannerpic.jpg"
                alt="AI-Powered Image Matching"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-teal-800/30 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h2 className="text-3xl font-bold mb-2">Vision 2025</h2>
                  <p className="text-teal-100 text-lg max-w-xl">
                    Discover every moment captured of you. Let our system find
                    and deliver your photos effortlessly and instantly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full bg-teal-400/10 blur-xl"></div>
        <div className="absolute bottom-1/4 right-20 w-32 h-32 rounded-full bg-emerald-400/10 blur-xl"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-teal-300/10 blur-lg"></div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-emerald-600">
            Our Partners
          </h2>
          <PartnerScroll />
        </div>
      </section>

      {/* L-shaped Picture Gallery */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 ">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-emerald-600">
            Our Picture Gallery
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-16">
            Explore our collection of stunning images available through our
            platform
          </p>

          {/* Professional Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:mx-5">
            {previewImages.map((image, index) => (
              <div
                key={image.id}
                className={`relative group ${
                  index === 0
                    ? "sm:col-span-2 lg:col-span-3 h-[450px]"
                    : "h-[200px]"
                }`}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-300 to-emerald-300 rounded-xl blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-full h-full rounded-xl overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 text-white">
                      {/* <h3 className="text-lg font-semibold">{image.title}</h3> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works with gradient numbers */}
      <section className="py-20 bg-gradient-to-b from-white to-teal-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-teal-800 to-emerald-600">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-6 mx-5">
            {[
              {
                step: "1",
                title: "Register",
                description: "Create your account in seconds",
              },
              {
                step: "2",
                title: "Take a Selfie",
                description: "Use our easy selfie capture tool",
              },
              {
                step: "3",
                title: "Get Access",
                description: "Instantly access your image collection",
              },
              {
                step: "4",
                title: "Download",
                description: "Save and share your favorite images",
              },
            ].map((item, index) => (
              <div key={index} className="text-center group">
                <div className="relative mx-auto mb-4">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 opacity-70 blur-sm group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 text-white flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-teal-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
