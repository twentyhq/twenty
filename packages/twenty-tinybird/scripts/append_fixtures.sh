
#!/usr/bin/env bash
set -euxo pipefail

directory="datasources/fixtures"
extensions=("csv" "ndjson")

absolute_directory=$(realpath "$directory")

for extension in "${extensions[@]}"; do
  file_list=$(find "$absolute_directory" -type f -name "*.$extension")

  for file_path in $file_list; do
    file_name=$(basename "$file_path")
    file_name_without_extension="${file_name%.*}"

    command="tb datasource append $file_name_without_extension datasources/fixtures/$file_name"
    echo $command
    $command
  done
done
