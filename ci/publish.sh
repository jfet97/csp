#!/bin/bash

set -e

not_exists() {
  [ -z "${!1}" ]
}

check_env() {
  if not_exists $1; then
    echo "Environment variable ($1) not set"
    exit 1
  fi
}

is_publish_branch() {
  [ "${!1}" = master ] 
}

get_version_bump() {
  local last_msg=`git log -1 --oneline --pretty=%B`
  if [[ $last_msg == "[publish] "* ]]; then
    echo "$last_msg" | sed -n -e 's/\[publish\] \(.*\)/\1/p'
  else
    echo "patch"
  fi
}

if is_publish_branch "CIRCLE_BRANCH"; then
  : ${NPM_USER:=paybase-ci}
  : ${NPM_EMAIL:=ci@paybase.io}  

  check_env "NPM_USER"
  check_env "NPM_PASS"
  check_env "NPM_EMAIL"

  echo -e "$NPM_USER\n$NPM_PASS\n$NPM_EMAIL" | npm login

  npm version `get_version_bump` -m '[ci skip] %s'
  git push && git push --tags

  npm publish
fi
