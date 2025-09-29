// app/page.js
import { redirect } from "next/navigation";

export default function ChatPage() {

  redirect("/auth/chat"); 
}