import { createClient } from "@/lib/supabase/server";
import { LoginForm, type DemoUser } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_account")
    .select("username, password, role")
    .order("role")
    .order("username");

  const demos: DemoUser[] = (data ?? []).map((u) => ({
    role:     u.role as DemoUser["role"],
    username: u.username,
    password: u.password,
  }));

  return <LoginForm demos={demos} />;
}
