import Image from "next/image";
import { SHOW_WORK_IN_PROGRESS } from "./site-config";
import MusubiWheel from "./components/MusubiWheel";
import CartBar from "./components/CartBar";

export default function Home() {
  if (SHOW_WORK_IN_PROGRESS) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
        <Image
          src="/images/WORK-IN-PROGRESS.png"
          alt="Musubi Man work-in-progress sketch"
          width={2388}
          height={1668}
          className="w-full max-w-2xl"
          priority
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4  text-center sm:px-8">
      <h1 className="font-dela text-2xl text-musubi-maroon sm:text-3xl absolute top-10">
        MUSUBI MAN{" "}
        <span className="font-league text-lg text-musubi-brown sm:text-xl">
          — fresh musubi, made to order
        </span>
      </h1>

      <MusubiWheel />
      <CartBar />
    </main>
  );
}
