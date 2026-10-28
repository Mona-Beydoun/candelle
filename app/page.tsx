import Image from "next/image";
import OrderDashboard from "@/components/OrderDashboard";

export default function Home() {
  return (
    <main className="app-shell relative flex h-dvh w-full flex-col overflow-hidden bg-[#1c130e]">
      <Image
        src="/images/hero.jpg"
        alt="Warm white pillar candles glowing on a dark wooden table"
        fill
        priority
        sizes="100vw"
        className="page-background absolute inset-0 z-0 object-cover object-[75%_center]"
      />
      <div aria-hidden="true" className="page-overlay absolute inset-0 z-0" />

      <OrderDashboard />

      <footer className="site-footer relative z-10 flex flex-none items-center justify-center px-3 pb-3 pt-1 text-center text-xs text-[#faf3e3]/75">
        <p className="font-medium tracking-wide">
          Candelle <span className="text-[#e0a030]">·</span> Nour Candle Studio{" "}
          <span className="text-[#e0a030]">·</span> Beirut{" "}
          <span className="text-[#e0a030]">·</span> Photo by Treedeo on Pexels
        </p>
      </footer>
    </main>
  );
}
