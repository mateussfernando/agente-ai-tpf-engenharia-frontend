// app/page.js
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/auth/login");

  // Este código não será executado
  return null;
}
