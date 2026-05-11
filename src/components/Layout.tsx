import type { ReactNode } from "react";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Header />
      {children}
    </div>
  );
}
