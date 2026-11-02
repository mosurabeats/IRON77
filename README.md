# IRON77

Golden-era bodybuilding app: Mentzer's Heavy Duty, Arnold, Reg Park, Gironda and the Venice Beach era.
Named for 1977, the year of *Pumping Iron*.

- **Today**: your next workout, Heavy Duty-style recovery status and today's protocol doses.
- **Train**: 7 classic programs, an exercise library with animated demos and form cues, a set-by-set logger with last-time numbers, overload hints, a rest timer and a logbook.
- **Stack**: a protocol tracker for supplements, peptides and hormones (schedules, dose logging, site rotation, syringe maths, supply, adherence, bodyweight). Settings has a reconstitution and dose calculator.

## Run it
No build step. Serve the folder and open it in a browser:

    python3 -m http.server 8000

On a phone, open it and choose **Add to Home Screen**. It works offline. Data is stored on the device;
use Settings → Export to make a backup.

## Structure
- `js/data.js`: programs, exercises, and compounds (edit here to add content)
- `js/app.js`: views and logic
- `styles.css`, `index.html`, `sw.js` (offline), `manifest.webmanifest`
