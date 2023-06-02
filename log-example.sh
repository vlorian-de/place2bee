#!/bin/bash

# Example prompt:
# './log-example.sh 25.3000 35.65192 41.626249024323374 29.389677414075895'

# InfluxDB Parameter
WRITE_TOKEN="abc1234=="
READ_TOKEN="abc5678=="
INFLUX_ORG="test-corp"
INFLUX_BUCKET="log"
INFLUX_URL="https://us-east-1-1.aws.cloud2.influxdata.com"


# Check script arguments
if [ $# -ne 4 ]; then
  echo "Please provide measurement data in the following format: "
  echo "./log-example temperature humidity longitude latitude"
  exit 1
fi

# Build measurement data
echo start
echo $1 $2
MEASUREMENT="box,box_id=1 temperature=$1,humidity=$2,long=$3,lat=$4"
echo stop


# Send data to InfluxDB
RESULT= curl --request POST "${INFLUX_URL}/api/v2/write?org=${INFLUX_ORG}&bucket=${INFLUX_BUCKET}&precision=s" \
  --header "Authorization: Token ${WRITE_TOKEN}" \
  --header "Content-Type: text/plain; charset=utf-8" \
  --header "Accept: application/json" \
  --data-binary '
    box,box_id=1 temperature=23.9703,humidity=35.23103,long=48.626549024323374,lat=9.337677414075895
    box,box_id=2 temperature=25.3000,humidity=35.65192,long=48.626549024323374,lat=9.387677414075895
  '


# curl --request POST ${INFLUX_URL}/api/v2/query -sS \
#   --header "Authorization: Token ${READ_TOKEN}" \
#   --header 'Accept:application/csv' \
#   --header 'Content-type:application/vnd.flux' \
#   -d 'from(bucket:"log")
#         |> range(start:-5d)
#      '
# exit 0
