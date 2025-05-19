"use client";

import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { SelfieCapture } from "../../components/selfie-capture";
import { Camera, Upload } from "lucide-react";
import { db, storage } from "../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

interface FormData {
  name: string;
  email: string;
  phone: string;
}

function base64ToBlob(base64Data: string, contentType = "image/jpeg") {
  const byteCharacters = atob(base64Data.split(",")[1]);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}

export default function RegisterPage() {
  const router = useRouter();
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
  });

  const [image, setImage] = useState<string | null>(null);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && db) {
      setFirebaseReady(true);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSelfieCapture = (imageSrc: string) => {
    setImage(imageSrc);
    setShowSelfieCapture(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!firebaseReady || !image) {
      alert("Firebase not ready or no image provided.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user exists

      const imageRef = ref(storage, `selfies/${formData.phone}_selfie.jpg`);

      await uploadString(imageRef, image, "data_url");
      const downloadURL = await getDownloadURL(imageRef);
      console.log(
        "Image uploaded to Firebase Storage:",
        downloadURL,
        formData.phone
      );

      const q = query(
        collection(db, "registrations"),
        where("phone", "==", formData.phone)
      );
      const querySnapshot = await getDocs(q);

      let docId: string;
      console.log("querySnapshot.empty=>", querySnapshot.empty);
      if (!querySnapshot.empty) {
        console.log("OVER RIDE USER");
        docId = querySnapshot.docs[0].id;
        console.log("formData.name=>", formData.name);
        await setDoc(doc(db, "registrations", docId), {
          name: formData.name,
          imageUrl: downloadURL,
          timestamp: serverTimestamp(),
        });
      } else {
        console.log("adding user ");
        // Add new user
        const docRef = await addDoc(collection(db, "registrations"), {
          ...formData,
          name: formData.name,
          imageUrl: downloadURL,
          timestamp: serverTimestamp(),
        });
        docId = docRef.id;
      }

      localStorage.setItem(
        "nief-user",
        JSON.stringify({ ...formData, imageUrl: downloadURL })
      );

      router.push(`/matched-images?name=${encodeURIComponent(formData.name)}`);

      // Face match API
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br m-auto flex items-center from-teal-50 via-white to-emerald-50">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-max flex items-center mx-auto">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-3xl blur-sm"></div>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl">
              <div className="md:flex">
                {/* Left */}
                <div className="md:w-5/12 bg-gradient-to-br from-teal-600 to-emerald-500 text-white p-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Unlock Your Images With Just a Selfie
                  </h2>
                  <p className="text-teal-100 mb-6">
                    Register now to access your personalized image collection.
                  </p>

                  <div className="space-y-6 mt-8">
                    {[1, 2, 3].map((step, idx) => (
                      <div key={step} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <span className="text-sm font-bold">{step}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {
                              [
                                "Create Account",
                                "Take a Selfie",
                                "Access Your Images",
                              ][idx]
                            }
                          </h3>
                          <p className="text-sm text-teal-100">
                            {
                              [
                                "Fill in your details to register",
                                "Use our camera to capture your selfie",
                                "Get instant access to your collection",
                              ][idx]
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right */}
                <div className="md:w-7/12 p-8">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl font-bold text-teal-800 mb-6">
                      Create Your Account
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {["name", "email", "phone"].map((field) => (
                        <div className="space-y-2" key={field}>
                          <Label htmlFor={field} className="text-gray-700">
                            {field === "name"
                              ? "Full Name"
                              : field === "email"
                              ? "Email Address"
                              : "Phone Number"}
                          </Label>
                          <Input
                            id={field}
                            name={field}
                            type={field === "email" ? "email" : "text"}
                            placeholder={`Enter your ${field}`}
                            required
                            value={(formData as any)[field]}
                            onChange={handleInputChange}
                          />
                        </div>
                      ))}

                      <div className="space-y-3">
                        <Label className="text-gray-700">Profile Image</Label>
                        <div className="flex flex-col gap-4">
                          {image ? (
                            <div className="flex flex-col items-center">
                              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-teal-500">
                                <Image
                                  src={image}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setImage(null)}
                                className="mt-2 text-sm text-teal-600 hover:text-teal-800"
                              >
                                Remove image
                              </button>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                              <div className="relative">
                                <Input
                                  id="image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors">
                                  <Upload size={18} />
                                  <span>Upload Image</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setShowSelfieCapture(true)}
                                className="flex items-center justify-center gap-2 border border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors"
                              >
                                <Camera size={18} />
                                <span>Take Selfie</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || !firebaseReady}
                        className="w-full py-6 rounded-lg bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 text-white font-medium text-lg"
                      >
                        {!firebaseReady
                          ? "Initializing..."
                          : isSubmitting
                          ? "Processing..."
                          : "Complete Registration"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSelfieCapture && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl blur-sm"></div>
            <div className="relative bg-white rounded-xl max-w-md w-full p-6">
              <SelfieCapture
                onCapture={handleSelfieCapture}
                onCancel={() => setShowSelfieCapture(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
