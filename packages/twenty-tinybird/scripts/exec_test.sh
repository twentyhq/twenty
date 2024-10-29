
#!/usr/bin/env bash
set -euxo pipefail

export TB_VERSION_WARNING=0

run_test() {
    t=$1
    echo "** Running $t **"
    echo "** $(cat $t)"
    tmpfile=$(mktemp)
    retries=0
    TOTAL_RETRIES=3

    # When appending fixtures, we need to retry in case of the data is not replicated in time
    while [ $retries -lt $TOTAL_RETRIES ]; do
        # Run the test and store the output in a temporary file
        bash $t $2 >$tmpfile
        exit_code=$?
        if [ "$exit_code" -eq 0 ]; then
            # If the test passed, break the loop
            if diff -B ${t}.result $tmpfile >/dev/null 2>&1; then
                break
            # If the test failed, increment the retries counter and try again
            else
                retries=$((retries+1))
            fi
        # If the bash command failed, print an error message and break the loop
        else
            break
        fi
    done

    if diff -B ${t}.result $tmpfile >/dev/null 2>&1; then
        echo "✅ Test $t passed"
        rm $tmpfile
        return 0
    elif [ $retries -eq $TOTAL_RETRIES ]; then
        echo "🚨 ERROR: Test $t failed, diff:";
        diff -B ${t}.result $tmpfile
        rm $tmpfile
        return 1
    else
        echo "🚨 ERROR: Test $t failed with bash command exit code $?"
        cat $tmpfile
        rm $tmpfile
        return 1
    fi
    echo ""
}
export -f run_test

fail=0
find ./tests -name "*.test" -print0 | xargs -0 -I {} -P 4 bash -c 'run_test "$@"' _ {} || fail=1

if [ $fail == 1 ]; then
  exit -1;
fi
