import Image from "next/image";
import { SHOW_WORK_IN_PROGRESS } from "./site-config";
import OrderMenu from "./components/OrderMenu";

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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
      <h1 className="font-dela text-2xl text-musubi-maroon sm:text-3xl">
        Musubi Man{" "}
        <span className="font-league text-lg text-musubi-brown sm:text-xl">
          — fresh musubi, made to order
        </span>
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <OrderMenu />
      </div>
    </main>
  );
}
