"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router=useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#F9FAFB]">
      <div className="w-full max-w-md flex flex-col items-center space-y-8">
        {/* Logo & Header */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="relative h-16 w-16 mb-2">
            <Image
              src="/umurava.png"
              alt="Umurava logo"
              fill
              className="object-contain"
            />
          </div>
          <Typography variant="h2" className="text-gray-900">
            Umurava AI
          </Typography>
          <Typography variant="caption" className="text-gray-600">
            AI Talent Screener
          </Typography>
        </div>

        {/* Sign In Card */}
        <Card className="w-full border-gray-100/80">
          <div className="space-y-8 p-1"> {/* Extra internal spacing */}
            <div className="space-y-4">
              <Typography variant="h3" className="text-gray-900 tracking-tight">
                Sign in
              </Typography>
              <Typography variant="caption" className="text-gray-600">
                Enter your credentials to continue
              </Typography>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                required
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                icon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                }
              />

              <Button type="submit" size="full" className="mt-2" onClick={()=>router.push("/dashboard")}>
                Sign in
              </Button>
            </form>

          
          </div>
        </Card>
      </div>
    </main>
  );
}
