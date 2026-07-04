# Amalgam Event Calendar Embed

This folder contains a safer replacement for a plain Airtable calendar iframe.

## Files

- `squarespace-embed.html` is the code to paste into a Squarespace Embed/Code block.
- `airtable-events-proxy-worker.js` is a small Cloudflare Worker that reads the Airtable Events table without exposing the Airtable token in the browser.

## Why the proxy is needed

Do not put an Airtable personal access token in website embed code. Browser code is public, so the token would be visible to visitors. The Worker keeps the token server-side and returns only the public event fields needed by the calendar.

## Airtable fields used

Base: `Amalgam Improv CRM`

Table: `Events`

- `Event Name`
- `Date`
- `Time Start`
- `Time End`
- `Location`
- `About`
- `Event URL`
- `Website RSS Display`

## Worker setup

Create a Worker and add these environment variables:

- `AIRTABLE_TOKEN`: Airtable personal access token with read access to the CRM base.
- `AIRTABLE_BASE_ID`: `appzKyuuOnfwh3SPh`
- `AIRTABLE_TABLE_ID`: `tblE9mxPjan62Dgo2`
- `AIRTABLE_VIEW`: optional, set this to the public calendar view name or view ID if you want the Worker to exactly follow an existing filtered Airtable view.
- `EVENT_WINDOW_DAYS`: optional, defaults to `365`.
- `INCLUDE_PRIVATE`: optional, set to `true` only if records marked `Website RSS Display = Private` should appear.
- `CORS_ALLOWED_ORIGIN`: optional, set to `https://www.amalgamimprov.com` after testing.

After deploying the Worker, replace `https://YOUR-WORKER-URL.example.workers.dev` in `squarespace-embed.html` with the deployed Worker URL.

## Native Airtable iframe option

A native Airtable calendar embed can show details when a visitor clicks an event if the calendar view's expanded-record field visibility is configured correctly. In Airtable, hide internal fields and show only the public fields listed above. Do not enable "Show all fields in expanded records" unless every field in the table is safe for public display.

