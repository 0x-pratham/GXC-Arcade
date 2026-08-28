// lib/actions.ts
import { supabase } from "./supabase";

// ---------------- AUTH PIPELINES ----------------

export async function registerUser(
  email: string,
  password: string,
  username: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

// ---------------- GAME PIPELINES ----------------

export async function getActiveGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("SUPABASE FETCH ERROR:", error.message, error.details);
    return [];
  }

  return data || [];
}

/**
 * Deduct exactly one game credit from the user's profile.
 *
 * The update uses `.select().single()` so we can verify that
 * Supabase actually returned the updated row.
 *
 * If RLS or another database rule blocks the update,
 * this function will return a failure instead of pretending
 * that the credit was deducted.
 */
export async function deductGameCredit(userId: string) {
  try {
    // 1. Fetch the user's current credit balance
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      throw new Error("Profile not found");
    }

    // 2. Prevent negative credits
    if (profile.credits <= 0) {
      return {
        success: false,
        message: "Out of credits",
      };
    }

    // 3. Deduct exactly one credit
    //
    // `.select().single()` verifies that the database
    // actually returned the updated profile row.
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        credits: profile.credits - 1,
      })
      .eq("id", userId)
      .select()
      .single();

    // 4. Database update failed
    if (updateError) {
      console.error("Credit update failed:", updateError);

      throw new Error("Database update failed!");
    }

    // 5. No updated row means the update was blocked
    // or no matching row was available.
    if (!updatedProfile) {
      throw new Error(
        "Blocked by Database Security (RLS)."
      );
    }

    // 6. Successfully deducted the credit
    return {
      success: true,
      remaining: updatedProfile.credits,
    };
  } catch (error: any) {
    console.error("Credit Error:", error);

    return {
      success: false,
      message: error?.message || "Failed to deduct game credit.",
    };
  }
}

// ---------------- SCORE & LEADERBOARD PIPELINES ----------------

export async function submitScore(
  gameId: string,
  userId: string,
  score: number
) {
  const { data, error } = await supabase
    .from("scores")
    .insert([
      {
        game_id: gameId,
        user_id: userId,
        score: score,
      },
    ])
    .select();

  if (error) {
    console.error("Error submitting score:", error);
    throw error;
  }

  return data;
}

export async function getTopScores(gameId: string) {
  const { data, error } = await supabase
    .from("scores")
    .select(`
      score,
      played_at,
      profiles ( username )
    `)
    .eq("game_id", gameId)
    .order("score", { ascending: false })
    .limit(3);

  if (error) throw error;

  return data;
}

export async function getUserScores(userId: string) {
  const { data, error } = await supabase
    .from("scores")
    .select(`
      score,
      played_at,
      games ( title, thumbnail_url )
    `)
    .eq("user_id", userId)
    .order("score", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching user scores:", error);
    return [];
  }

  return data;
}

// ---------------- SESSION PIPELINES ----------------

export async function verifyUserSession(userId: string) {
  const {
    data: session,
    error: sessionError,
  } = await supabase
    .from("arcade_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (sessionError || !session) {
    return {
      allowed: false,
      reason:
        "No active session found. Ask admin for playtime.",
    };
  }

  const now = new Date();
  const endTime = new Date(session.end_time);

  if (now > endTime) {
    await supabase
      .from("arcade_sessions")
      .update({ is_active: false })
      .eq("id", session.id);

    await supabase
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", userId);

    return {
      allowed: false,
      reason:
        "Time's up! Your account is suspended. Contact Admin.",
    };
  }

  return {
    allowed: true,
    session: session,
  };
}

// ---------------- ADMIN PIPELINES ----------------

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return data;
}

export async function createArcadeSession(
  userId: string,
  durationMinutes: number
) {
  const startTime = new Date();

  const endTime = new Date(
    startTime.getTime() + durationMinutes * 60000
  );

  const { data, error } = await supabase
    .from("arcade_sessions")
    .insert([
      {
        user_id: userId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        is_active: true,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}

// ---------------- POPUP PIPELINES (ADMIN) ----------------

export async function getActivePopup() {
  const { data, error } = await supabase
    .from("popups")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

export async function createGlobalPopup(
  title: string,
  message: string
) {
  await supabase
    .from("popups")
    .update({ is_active: false })
    .neq("title", "placeholder_to_update_all");

  const { data, error } = await supabase
    .from("popups")
    .insert([
      {
        title,
        message,
        is_active: true,
      },
    ])
    .select();

  if (error) throw error;

  return data;
}

export async function disableGlobalPopup() {
  const { error } = await supabase
    .from("popups")
    .update({ is_active: false })
    .eq("is_active", true);

  if (error) throw error;
}

// Add this inside lib/actions.ts

export async function addCredits(userId: string, amount: number) {
  // 1. Fetch current credits
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) throw new Error("Profile not found");

  const newCredits = (profile.credits || 0) + amount;

  // 2. Update with new credits
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits: newCredits })
    .eq('id', userId);

  if (updateError) throw new Error("Failed to add credits");

  return newCredits;
}

// lib/actions.ts ke end me add karein

export async function getGlobalLeaderboard() {
  const { data, error } = await supabase
    .from('global_leaderboard')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(100);

  if (error) {
    console.error("Error fetching global leaderboard:", error);
    return [];
  }
  return data;
}

// Add this to lib/actions.ts

// FETCH DETAILED LOGS FOR ADMIN
export async function getAllDetailedScores() {
  const { data, error } = await supabase
    .from('scores')
    .select(`
      id,
      score,
      played_at,
      games ( title ),
      profiles ( username )
    `)
    .order('played_at', { ascending: false });

  if (error) {
    console.error("Error fetching detailed scores:", error);
    return [];
  }
  return data;
}