#!/bin/bash
# List all calendars with their properties
# Usage: cal-list.sh

osascript <<'EOF'
tell application "Calendar"
    set calNames to name of every calendar
    set output to ""
    repeat with i from 1 to count of calNames
        set calName to item i of calNames
        set output to output & calName & linefeed
    end repeat
    return output
end tell
EOF
