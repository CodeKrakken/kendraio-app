HTTP Request
============

Get, put or post data to an external HTTP endpoint.


Default config
--------------

.. code-block:: json

    {
      "type": "http",
      "method": "get",
      "endpoint": {
        "protocol": "https:",
        "host": "jsonplaceholder.typicode.com",
        "pathname": "/posts",
        "query": {
          "userId": 1
        }
      }
      "useProxy": false
    }

Supported properties
--------------------

- **method** - REQUIRED - allowed values are get, put, post, and delete.
- **useProxy** (boolean) (default = false) - Set to true to use a proxy. Useful for CORS. Proxy setting are set at https://app.kendra.io/core/settings
- **notify** (boolean) (default = true) -  Show a notification message if the request is successful. This message is not
  sent when the HTTP method is GET, but can be turned on and off for POST, PUT, and DELETE requests by using this
  property.
- **headers** - A set of headers with header name as object key. Values are processed by JMESpath
- **endpoint** - The request endpoint. Can take multiple forms. See below. 


Examples
--------

For simple requests, the ``endpoint`` can just be a simple string:

.. code-block:: json

    {
        "type": "http",
        "method": "get",
        "endpoint": "https://covid19.mathdro.id/api",
        "useProxy" : true
    }


If the endpoint needs to be constructed from data, the endpoint can be specified as an object with a "valueGetter" attribute. 

.. code-block:: json

    {
        "type": "http",
        "method": "get",
        "endpoint": {
            "valueGetter": "context.saved"
        }
    }


For advanced use cases, the payload can be constructed using a JMES Path expression.
Custom headers can also be specified using JMES Path expressions:

.. code-block:: json

  {
      "type": "http",
      "method": "post",
      "endpoint": {
          "protocol": "https:",
          "host": "accounts.spotify.com",
          "pathname": "/api/token"
      },
      "payload": "'grant_type=client_credentials'",
      "headers": {
          "Content-Type": "'application/x-www-form-urlencoded'",
          "Authorization": "join('', ['Basic ', btoa(join('', [data.client_id, ':', data.client_secret]))])"
      }
  }

It is possible to query a GraphQL endpoint using the HTTP block.

.. code-block:: json

  {
      "type": "http",
      "method": "post",
      "notify": false,
      "endpoint": {
          "protocol": "https:",
          "host": "valnet.lurker.dev",
          "pathname": "/api/graphql"
      },
      "payload": "{ query: 'query ($token: String) {  viewer(token: $token) {    allCommitments {      id      action      plannedStart      committedOn      due      committedQuantity {        numericValue        unit {          name        }      }      note      resourceClassifiedAs {        name        category      }      involves {        id        resourceClassifiedAs {          name          category        }        trackingIdentifier      }      provider {        id        name      }      receiver {        id        name      }      inputOf {        id        name      }      outputOf {        id        name      }      scope {        id        name      }      plan {        id        name      }      isPlanDeliverable      forPlanDeliverable {        id        action        outputOf {          name        }      }      isDeletable    }  }}', variables: { token: context.vfAuth } }"
  }


Pagination
----------

If a HTTP API returns paginated results with a standard link header, to fetch paginated API results, set the followPaginationLinksMerged option to true. This will fetch all pages of results and return the combined set of results from all the pages.

With a proxy:
```json
{
  "type": "http",
  "method": "GET",
  "endpoint": "https://example.com/paginated",
  "useProxy": true,
  "followPaginationLinksMerged": true
}
```
