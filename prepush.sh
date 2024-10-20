#!/bin/bash


if ! git diff-index --quiet HEAD --; then
    git stash --include-untracked --quiet
    stashed=true
else
    stashed=false
fi


if npm run build:safe; then
    echo 'Build successful'
    result=0
else
    echo 'Build failed'
    result=1
fi


if [ "$stashed" = true ]; then
    git stash pop --quiet
fi


exit $result