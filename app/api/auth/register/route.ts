import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function normalizePhoneNumber(value: string) {
  const compact = value.trim().replace(/[\s().-]/g, "");
  if (/^\d{10}$/.test(compact)) return `+91${compact}`;
  if (/^91\d{10}$/.test(compact)) return `+${compact}`;
  return compact;
}

export async function POST(request: Request) {
  let body: { email?: string; password?: string; username?: string; phoneNumber?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const username = body.username?.trim() ?? "";
  const phoneNumber = normalizePhoneNumber(body.phoneNumber ?? "");

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must contain at least 6 characters." }, { status: 400 });
  }
  if (!username || username.length > 50) {
    return NextResponse.json({ error: "Enter a username of 1 to 50 characters." }, { status: 400 });
  }
  if (!/^\+[1-9]\d{7,14}$/.test(phoneNumber)) {
    return NextResponse.json({
      error: "Enter a valid phone number with country code, such as +919876543210. Indian 10-digit numbers are also accepted.",
    }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Registration requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    return NextResponse.json({ error: "Registration is not configured on the server yet." }, { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingPhone, error: phoneLookupError } = await admin
    .from("profiles")
    .select("id")
    .eq("phone_number", phoneNumber)
    .maybeSingle();

  if (phoneLookupError) {
    console.error("Could not check phone number uniqueness:", phoneLookupError.message);
    return NextResponse.json({ error: "Unable to validate that phone number. Please try again." }, { status: 500 });
  }
  if (existingPhone) {
    return NextResponse.json({ error: "That phone number is already registered. Use another number or log in." }, { status: 409 });
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (createError || !created.user) {
    const message = createError?.message ?? "Unable to create account.";
    const duplicate = /already|registered|exists|duplicate/i.test(message);
    return NextResponse.json({
      error: duplicate
        ? "An account with that email or phone number already exists."
        : "Unable to create your account. Check your details and try again.",
    }, { status: duplicate ? 409 : 400 });
  }

  // The auth.users trigger creates the profile. Save the phone number as
  // profile contact information only; authentication is email/password only.
  const { error: profileError } = await admin
    .from("profiles")
    .update({ phone_number: phoneNumber })
    .eq("id", created.user.id);

  if (profileError) {
    console.error("Could not save phone number to profile:", profileError.message);
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({
      error: "We couldn't finish setting up your profile. Please try again.",
    }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
