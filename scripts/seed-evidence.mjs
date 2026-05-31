// Seed sample evidence files into the complaint-evidence bucket and
// update every complaint with a clean title + the public URL of the
// uploaded file.
//
// Run with:
//   node --env-file=.env.local scripts/seed-evidence.mjs
//
// Idempotent: re-running upserts the same files at the same paths
// and re-sets the same DB columns.

import { createClient } from "@supabase/supabase-js";
import { Buffer } from "node:buffer";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
const BUCKET = "complaint-evidence";

// One sample image per complaint. picsum.photos returns a stable
// random image per seed, so re-runs produce the same picture.
const samples = [
  { id: "CMP-01", title: "Wallet stolen at coffee shop",         seed: "wallet"     },
  { id: "CMP-02", title: "Strange charges on bank card",         seed: "bankcard"   },
  { id: "CMP-03", title: "Hit and run on Highway 7",             seed: "highway"    },
  { id: "CMP-04", title: "Suspicious crates at dock 4",          seed: "docks"      },
  { id: "CMP-05", title: "Body found behind 5th Street",         seed: "alley"      },
  { id: "CMP-06", title: "Drug deal in parking lot",             seed: "parking"    },
  { id: "CMP-07", title: "Unattended package, terminal B",       seed: "airport"    },
  { id: "CMP-08", title: "House burglarized overnight",          seed: "house"      },
  { id: "CMP-09", title: "Dating app scam, $2,400",              seed: "phone"      },
  { id: "CMP-10", title: "Storefront window smashed",            seed: "graffiti"   },
  { id: "CMP-11", title: "Daughter (12) missing from school",    seed: "school"     },
  { id: "CMP-12", title: "Got fake $100 bills as change",        seed: "cash"       },
  { id: "CMP-13", title: "Family dog stolen from front yard",    seed: "dog"        },
  { id: "CMP-14", title: "Attacked outside Murphy's Bar",        seed: "bar"        },
  { id: "CMP-15", title: "Anonymous messages on social media",   seed: "chat"       },
];

async function fetchImage(seed) {
  const res = await fetch(`https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`, {
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${seed}`);
  return Buffer.from(await res.arrayBuffer());
}

for (const { id, title, seed } of samples) {
  process.stdout.write(`${id} (${seed}) … `);

  const path = `seed/${id}-${seed}.jpg`;

  try {
    const buf = await fetchImage(seed);

    const { error: upErr } = await supabase
      .storage
      .from(BUCKET)
      .upload(path, buf, { contentType: "image/jpeg", upsert: true });
    if (upErr) throw new Error(`upload: ${upErr.message}`);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

    const { error: updErr } = await supabase
      .from("complaint")
      .update({ title, evidence_url: publicUrl })
      .eq("complaint_id", id);
    if (updErr) throw new Error(`update: ${updErr.message}`);

    console.log("ok");
  } catch (err) {
    console.log("FAIL");
    console.error(`  ↳ ${err.message}`);
  }
}

console.log("\nDone.");
