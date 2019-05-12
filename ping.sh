server=${1:-"fake-server"}
curl -H "Host: $server" localhost
