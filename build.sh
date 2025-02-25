#!/bin/sh
project_path=$(pwd)
project_name="${project_path##*/}"
dir="$HOME/Downloads/${project_name}"

rm -rf "$dir"

cp -r "$project_path"  "$dir"
files_to_remove=(
    ".git"
    ".gitignore"
    ".idea"
    ".DS_Store"
    "build.sh"
    "win_build.bat"
)

# 遍历列表并删除每个文件或目录
for file in "${files_to_remove[@]}"; do
    # shellcheck disable=SC2115
    rm -rf "$dir/$file"
done


cd "$HOME/Downloads" && zip -r "${project_name}.zip" "${project_name}"

rm -rf "$dir"
