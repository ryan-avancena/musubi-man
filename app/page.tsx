import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      {/* <h1 className="font-dela text-4xl text-musubi-maroon">Musubi Man</h1> */}
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