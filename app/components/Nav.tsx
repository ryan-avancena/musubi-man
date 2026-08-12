import Link from "next/link";

const links = [
  { href: "/#menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/#order", label: "Order" },
];

export default function Nav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-musubi-maroon/15 p-4 font-league text-base text-musubi-maroon lg:sticky lg:top-0 lg:h-screen lg:w-48 lg:shrink-0 lg:flex-col lg:items-start lg:justify-start lg:gap-6 lg:border-b-0 lg:border-r lg:p-6 lg:text-lg">
      <span className="font-dela text-lg leading-tight lg:text-xl">
        Musubi Man
      </span>
      <div className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:underline">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
