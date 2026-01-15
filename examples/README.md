# Argo Workflows Examples

This directory contains examples for working with Argo Workflows, specifically demonstrating how to submit workflows via HTTP POST requests.

## Files

- **`argo-workflow-example.md`** - Complete documentation with multiple examples in different languages
- **`submitArgoWorkflow.js`** - Executable Node.js example
- **`submit_argo_workflow.py`** - Executable Python example
- **`hello-argo-workflow.yaml`** - Sample workflow definition

## Quick Start

### Prerequisites

**For Node.js examples:**
- Node.js installed
- axios package (already available in the main project's package.json)

**For Python examples:**
- Python 3 installed
- Install dependencies: `pip install -r examples/requirements.txt`

### Using Node.js

```bash
# Set environment variables
export ARGO_SERVER=https://localhost:2746
export ARGO_TOKEN=your_token_here
export ARGO_NAMESPACE=default
# For production with valid SSL certificates, set:
# export ARGO_INSECURE_SKIP_TLS_VERIFY=false

# Run the example
node examples/submitArgoWorkflow.js
```

### Using Python

```bash
# Set environment variables
export ARGO_SERVER=https://localhost:2746
export ARGO_TOKEN=your_token_here
export ARGO_NAMESPACE=default
# For production with valid SSL certificates, set:
# export ARGO_INSECURE_SKIP_TLS_VERIFY=false

# Run the example
python examples/submit_argo_workflow.py
```

### Using cURL

```bash
curl -X POST https://localhost:2746/api/v1/workflows/default \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -k \
  --data @- <<'EOF'
{
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
}
EOF
```

## Authentication

To get an authentication token for Argo Workflows:

```bash
# Get the secret name
kubectl get secrets -n argo

# Extract the token
kubectl -n argo get secret <secret-name> -o jsonpath='{.data.token}' | base64 -d
```

## API Endpoint Format

The Argo Workflows API endpoint follows this format:

```
https://<host>:<port>/api/v1/workflows/<namespace>
```

- **host**: Your Argo server hostname (e.g., `localhost`, `argo.example.com`)
- **port**: Argo server port (default: `2746`)
- **namespace**: Kubernetes namespace where workflows will be created (e.g., `default`, `argo`)

## Workflow Structure

The workflow must be wrapped in a `workflow` object when submitting via the API:

```json
{
  "workflow": {
    "apiVersion": "argoproj.io/v1alpha1",
    "kind": "Workflow",
    "metadata": {
      "generateName": "hello-argo-"
    },
    "spec": {
      ...
    }
  }
}
```

Key fields:
- **`generateName`**: Prefix for the auto-generated workflow name
- **`entrypoint`**: The template to execute when the workflow runs
- **`templates`**: Array of template definitions

## Response

A successful submission returns the created workflow object:

```json
{
  "metadata": {
    "name": "hello-argo-abc123",
    "namespace": "default",
    "uid": "12345678-1234-1234-1234-123456789abc",
    ...
  },
  "spec": {
    ...
  },
  "status": {
    "phase": "Pending",
    ...
  }
}
```

## Checking Workflow Status

After submission, check the workflow status using:

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

### Connection Issues
- Verify the Argo server is running: `kubectl get pods -n argo`
- Check if port 2746 is accessible
- Ensure proper network connectivity

### Authentication Issues
- Verify your token is valid and not expired
- Check service account permissions
- Ensure the token has workflow creation privileges

### SSL/TLS Issues
- For development, use `-k` (curl) or `rejectUnauthorized: false` (Node.js)
- For production, configure proper SSL certificates
- Consider using a valid certificate authority

### Common HTTP Status Codes
- **200**: Success
- **401**: Unauthorized - check your authentication token
- **403**: Forbidden - check service account permissions
- **404**: Not found - verify namespace and API endpoint
- **500**: Server error - check Argo server logs

## More Information

For more details about Argo Workflows:
- [Official Documentation](https://argoproj.github.io/argo-workflows/)
- [API Documentation](https://argoproj.github.io/argo-workflows/swagger/)
- [GitHub Repository](https://github.com/argoproj/argo-workflows)
