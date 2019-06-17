# firefox-redirect-history-issue-sample

## Overview

This repo contains a small example demonstrating an apparent issue in Firefox's handling of full page "Reload" actions on an SPA performing only `replaceState` operations after loading initially via a 301 redirect.

The issue as described is present in the now-current version of Firefox, 67.0.2.

## Server Setup

1. Build the provided Docker image to serve the static files demonstrating the issue:

	```bash
	docker build -t firefox-redirect-history-issue-sample .
	```

1. Run the image in an interactive container with request logs visible (this example runs on port 3000):

	```bash
	docker run -it -p 3000:80 firefox-redirect-history-issue-sample
	```

## Steps to Reproduce

1. Open Firefox
1. Open the root page of the sample container (`http://localhost:3000` if using the commands above)
1. Click the "Redirect to /page1" link
1. Wait for `/page1` to load
1. Wait 3 seconds for the transition to `/page2` (via `history.replaceState`)
1. Wait 3 seconds for the transition to `/page3` (via `history.replaceState`)
1. On `/page3`, press the "Reload current page" button (or its keyboard shortcut) to reload `/page3`

## Expected Behavior

1. The browser makes a `GET` request to `{server}/page3`
1. The browser logs a console message `Navigated to {server}/page3`
1. The address bar remains at `/page3`
1. `window.location.pathname` remains `/page3` when the JavaScript loads, and `/page3` content is displayed

## Actual Behavior

1. The browser makes a `GET` request to `{server}/page3` (as expected)
1. The browser logs a console message `Navigated to {server}/page3` (as expected)
1. The address bar changes to `/page1` (__not__ expected)
1. `window.location.pathname` is set to `/page1` when the JavaScript loads, causing the entire sequence of transitions to occur; i.e. `/page1` to `/page2` to `/page3` (__not__ expected)

## Notes

1. If a call to `pushState` is introduced at any point in the history chain (between `/page1` and `/page2`, or between `/page2` and `/page3`), the issue no longer occurs and `/page3` reloads as expected
    * If only the transition between `/page2` and `/page3` is changed to `pushState`, reloading the page when it is on `/page2` (before getting to `/page3`) results in the problematic behavior and starts over at `/page1` -- only if we make it to `/page3` does the issue go away
1. Selecting the `/page3` URL in the address bar and hitting enter (to submit the request) results in a server request for `/page3` and, unlike the reload operation, __will not__ roll back the location history to `/page1`. 
    * The location remains `/page3` as expected. At this point, subsequent page reload operations via the browser button or `location.reload()` will work as expected.
1. Chrome and Safari (desktop) do not exhibit the behavior described above and always reload `/page3` directly
