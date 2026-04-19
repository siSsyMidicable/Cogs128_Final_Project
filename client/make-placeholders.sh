#!/bin/bash
set -e
# List all source files that import from "@/..."
grep -R --line-number '"@/' . | grep -oP '"@/[^"]+' | sort | uniq | while read -r alias_import; do
    # Remove "@/" prefix to get the subpath
    rel_path="${alias_import#\"@/}"
    # Convert . to .tsx for component-ish code, .ts for everything else unless it’s a .js in import
    # Use .tsx by default (RN is JSX land)
    dir="`dirname \"$rel_path\"`"
    base="`basename \"$rel_path\"`"
    # Make parent directory
    mkdir -p "$dir"
    # Pick file extension: .tsx if not specified
    if [[ "$base" != *.* ]]; then
      file="$dir/$base.tsx"
    else
      file="$dir/$base"
    fi
    # If file exists, skip it
    if [[ -f "$file" ]]; then
      echo "Exists: $file"
      continue
    fi
    # Dummy file
    cat > "$file" <<ENDOFS
// AUTOMATIC PLACEHOLDER for $file
import React from 'react';
export default () => React.createElement('div', null, 'Placeholder: $file');
ENDOFS
    echo "Created: $file"
done
