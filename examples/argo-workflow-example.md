# Argo Workflow POST Request Example

This document demonstrates how to submit a workflow to an Argo Workflows server running at `https://localhost:2746`.

## Workflow Definition

The workflow we'll be submitting:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-argo-
spec:
  entrypoint: main
  templates:
  - name: main
    container:
      image: alpine:latest
      command: ["sh", "-c"]
      args: ["echo Hello, Argo!"]
```

## Examples

### 1. Using cURL

```bash
curl -X POST https://localhost:2746/api/v1/workflows/default \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -k \
  --data '{
    "workflow": {
      "apiVersion": "argoproj.io/v1alpha1",
      "kind": "Workflow",
      "metadata": {
        "generateName": "hello-argo-"
      },
      "spec": {
        "entrypoint": "main",
        "templates": [
          {
            "name": "main",
            "container": {
              "image": "alpine:latest",
              "command": ["sh", "-c"],
              "args": ["echo Hello, Argo!"]
            }
          }
        ]
      }
    }
  }'
```

**Notes:**
- The `-k` flag is used to skip SSL certificate verification (for self-signed certificates)
- Replace `YOUR_TOKEN_HERE` with your actual authentication token
- Replace `default` with your target namespace if different

### 2. Using JavaScript/Node.js with Axios

```javascript
const axios = require('axios');
const https = require('https');

const argoWorkflowUrl = 'https://localhost:2746/api/v1/workflows/default';

const workflow = {
  workflow: {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Workflow',
    metadata: {
      generateName: 'hello-argo-'
    },
    spec: {
      entrypoint: 'main',
      templates: [
        {
          name: 'main',
          container: {
            image: 'alpine:latest',
            command: ['sh', '-c'],
            args: ['echo Hello, Argo!']
          }
        }
      ]
    }
  }
};

// Create an HTTPS agent that ignores certificate validation
const agent = new https.Agent({
  rejectUnauthorized: false
});

async function submitWorkflow() {
  try {
    const response = await axios.post(argoWorkflowUrl, workflow, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      httpsAgent: agent
    });

    console.log('Workflow submitted successfully!');
    console.log('Workflow name:', response.data.metadata.name);
    console.log('Workflow UID:', response.data.metadata.uid);
    return response.data;
  } catch (error) {
    console.error('Error submitting workflow:', error.response?.data || error.message);
    throw error;
  }
}

// Execute the function
submitWorkflow();
```

### 3. Using JavaScript/Node.js with Fetch API

```javascript
const https = require('https');

const argoWorkflowUrl = 'https://localhost:2746/api/v1/workflows/default';

const workflow = {
  workflow: {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Workflow',
    metadata: {
      generateName: 'hello-argo-'
    },
    spec: {
      entrypoint: 'main',
      templates: [
        {
          name: 'main',
          container: {
            image: 'alpine:latest',
            command: ['sh', '-c'],
            args: ['echo Hello, Argo!']
          }
        }
      ]
    }
  }
};

// Create an HTTPS agent that ignores certificate validation
const agent = new https.Agent({
  rejectUnauthorized: false
});

async function submitWorkflow() {
  try {
    const response = await fetch(argoWorkflowUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      },
      body: JSON.stringify(workflow),
      agent: agent
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Workflow submitted successfully!');
    console.log('Workflow name:', data.metadata.name);
    console.log('Workflow UID:', data.metadata.uid);
    return data;
  } catch (error) {
    console.error('Error submitting workflow:', error.message);
    throw error;
  }
}

// Execute the function
submitWorkflow();
```

### 4. Using Python with Requests

```python
import requests
import json

# Disable SSL warnings for self-signed certificates
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

argo_workflow_url = 'https://localhost:2746/api/v1/workflows/default'

workflow = {
    'workflow': {
        'apiVersion': 'argoproj.io/v1alpha1',
        'kind': 'Workflow',
        'metadata': {
            'generateName': 'hello-argo-'
        },
        'spec': {
            'entrypoint': 'main',
            'templates': [
                {
                    'name': 'main',
                    'container': {
                        'image': 'alpine:latest',
                        'command': ['sh', '-c'],
                        'args': ['echo Hello, Argo!']
                    }
                }
            ]
        }
    }
}

def submit_workflow():
    try:
        response = requests.post(
            argo_workflow_url,
            json=workflow,
            headers={
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE'
            },
            verify=False  # Skip SSL certificate verification
        )
        
        response.raise_for_status()
        
        data = response.json()
        print('Workflow submitted successfully!')
        print(f"Workflow name: {data['metadata']['name']}")
        print(f"Workflow UID: {data['metadata']['uid']}")
        return data
    except requests.exceptions.RequestException as error:
        print(f'Error submitting workflow: {error}')
        raise

# Execute the function
if __name__ == '__main__':
    submit_workflow()
```

## Important Notes

1. **Authentication**: Most Argo Workflows installations require authentication. You'll need to obtain a bearer token:
   ```bash
   # Get the token from a service account
   kubectl -n argo get secret <secret-name> -o jsonpath='{.data.token}' | base64 -d
   ```

2. **SSL/TLS**: The examples use `-k` (curl) or `rejectUnauthorized: false` (Node.js) or `verify=False` (Python) to skip certificate verification. In production, you should use proper SSL certificates.

3. **Namespace**: Replace `default` in the URL with your target Kubernetes namespace.

4. **API Version**: The Argo Workflows API endpoint format is: `https://<host>:<port>/api/v1/workflows/<namespace>`

5. **Response**: A successful submission returns the created workflow object with a unique name (since we use `generateName`) and UID.

## Running the Workflow

After submission, you can check the workflow status:

```bash
# Using kubectl
kubectl get workflows -n default

# Using Argo CLI
argo list -n default

# Using the API
curl -X GET https://localhost:2746/api/v1/workflows/default/<workflow-name> \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -k
```

## Troubleshooting

- **Connection refused**: Ensure the Argo Workflows server is running and accessible on port 2746
- **401 Unauthorized**: Check your authentication token
- **403 Forbidden**: Verify your service account has permissions to create workflows
- **SSL errors**: Use the appropriate flag to skip certificate verification or configure proper certificates
