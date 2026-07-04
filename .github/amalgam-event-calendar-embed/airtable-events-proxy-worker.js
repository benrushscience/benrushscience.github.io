/**
 * Cloudflare Worker for the Amalgam Improv public event calendar.
 *
 * This keeps the Airtable token out of browser code and returns only the fields
 * needed by the website calendar.
 */

const DEFAULT_BASE_ID = "appzKyuuOnfwh3SPh";
const DEFAULT_TABLE_ID = "tblE9mxPjan62Dgo2";
const DEFAULT_TIME_ZONE = "America/Chicago";

const EVENT_FIELDS = [
  "Event Name",
  "Date",
  "Time Start",
  "Time End",
  "Location",
  "About",
  "Event URL",
  "Website RSS Display",
];

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = buildCorsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders);
    }

    if (!env.AIRTABLE_TOKEN) {
      return jsonResponse({ error: "AIRTABLE_TOKEN is not configured" }, 500, corsHeaders);
    }

    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    const cachedResponse = await cache.match(cacheKey);

    if (cachedResponse) {
      return withCors(cachedResponse, corsHeaders);
    }

    try {
      const events = await fetchAirtableEvents(env);
      const response = jsonResponse(
        {
          generatedAt: new Date().toISOString(),
          timeZone: DEFAULT_TIME_ZONE,
          events,
        },
        200,
        {
          ...corsHeaders,
          "Cache-Control": "public, max-age=300",
        },
      );

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch (error) {
      return jsonResponse(
        {
          error: "Unable to load events",
          detail: error instanceof Error ? error.message : String(error),
        },
        502,
        corsHeaders,
      );
    }
  },
};

async function fetchAirtableEvents(env) {
  const baseId = env.AIRTABLE_BASE_ID || DEFAULT_BASE_ID;
  const tableId = env.AIRTABLE_TABLE_ID || DEFAULT_TABLE_ID;
  const maxDays = Number.parseInt(env.EVENT_WINDOW_DAYS || "365", 10);
  const includePrivate = String(env.INCLUDE_PRIVATE || "").toLowerCase() === "true";

  const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
  url.searchParams.set("pageSize", "100");
  url.searchParams.set("returnFieldsByFieldId", "false");
  url.searchParams.set("sort[0][field]", "Date");
  url.searchParams.set("sort[0][direction]", "asc");

  if (env.AIRTABLE_VIEW) {
    url.searchParams.set("view", env.AIRTABLE_VIEW);
  }

  EVENT_FIELDS.forEach((fieldName) => {
    url.searchParams.append("fields[]", fieldName);
  });

  // Keep the response focused on upcoming events. The display category filter
  // can be disabled if the website intentionally publishes "Private" records.
  const dateFormula = `AND(IS_AFTER({Date}, DATEADD(TODAY(), -1, 'days')), IS_BEFORE({Date}, DATEADD(TODAY(), ${maxDays}, 'days')))`;
  const publicFormula = includePrivate
    ? dateFormula
    : `AND(${dateFormula}, OR({Website RSS Display} = BLANK(), {Website RSS Display} != 'Private'))`;

  url.searchParams.set("filterByFormula", publicFormula);

  const allRecords = [];
  let offset = null;

  do {
    if (offset) {
      url.searchParams.set("offset", offset);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Airtable returned ${response.status}: ${errorText}`);
    }

    const payload = await response.json();
    allRecords.push(...payload.records);
    offset = payload.offset;
  } while (offset);

  return allRecords.map(normalizeEvent).filter((event) => event.title && event.date);
}

function normalizeEvent(record) {
  const fields = record.fields || {};
  const location = fields.Location;
  const displayCategory = fields["Website RSS Display"];

  return {
    id: record.id,
    title: fields["Event Name"] || "Untitled event",
    date: fields.Date || null,
    startsAt: fields["Time Start"] || null,
    endsAt: fields["Time End"] || null,
    location: typeof location === "object" && location !== null ? location.name : location || "",
    description: fields.About || "",
    url: fields["Event URL"] || "",
    displayCategory:
      typeof displayCategory === "object" && displayCategory !== null
        ? displayCategory.name
        : displayCategory || "",
  };
}

function buildCorsHeaders(request, env) {
  const requestOrigin = request.headers.get("Origin");
  const allowedOrigin = env.CORS_ALLOWED_ORIGIN || "*";
  const origin =
    allowedOrigin === "*" || !requestOrigin || requestOrigin === allowedOrigin
      ? allowedOrigin
      : allowedOrigin;

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function withCors(response, corsHeaders) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
