import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function About() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-4 px-4 py-6 text-center sm:px-8">
      <Link
        href="/"
        className="flex items-center gap-1 self-start text-sm text-musubi-brown/80 hover:text-musubi-maroon"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to menu
      </Link>
      <h1 className="font-dela text-2xl text-musubi-maroon sm:text-3xl">
        About
      </h1>
      <p className="text-musubi-brown">
        Musubi Man is a small shop serving hand-rolled musubi, made fresh
        daily with quality ingredients. Order ahead and swing by for pickup.
      </p>
    </main>
  );
}
