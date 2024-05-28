#!/bin/bash
AWS_DYNAMODB_CLIENT_TABLE=${AWS_DYNAMODB_CLIENT_TABLE:-"local-clients"}
AWS_DYNAMODB_CHAT_TABLE=${AWS_DYNAMODB_CHAT_TABLE:-"local-chats"}

function createTable() {
    local tableName=$1

    # create the `clients` table in dynamo
    awslocal dynamodb create-table \
        --table-name ${tableName} \
        --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S AttributeName=pData,AttributeType=S \
        --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE \
        --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
        --global-secondary-indexes \
            "[
                {
                    \"IndexName\": \"sk-pData\",
                    \"KeySchema\": [ 
                        { \"AttributeName\": \"sk\", \"KeyType\": \"HASH\" },
                        { \"AttributeName\": \"pData\", \"KeyType\": \"RANGE\" }
                    ],
                    \"ProvisionedThroughput\": { \"ReadCapacityUnits\": 10, \"WriteCapacityUnits\": 5 },
                    \"Projection\": { \"ProjectionType\": \"ALL\" }
                }
            ]"

    # add TTL
    awslocal dynamodb update-time-to-live \
        --table-name ${tableName} \
        --time-to-live-specification Enabled=true,AttributeName=ttl
}

createTable ${AWS_DYNAMODB_CLIENT_TABLE}
createTable ${AWS_DYNAMODB_CHAT_TABLE}
