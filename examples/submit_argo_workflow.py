#!/usr/bin/env python3
"""
Argo Workflow Submission Example (Python)

This script demonstrates how to submit a workflow to an Argo Workflows server.

Usage:
    python examples/submit_argo_workflow.py

Environment Variables:
    ARGO_SERVER - Argo Workflows server URL (default: https://localhost:2746)
    ARGO_TOKEN - Bearer token for authentication
    ARGO_NAMESPACE - Kubernetes namespace (default: default)
"""

import os
import sys
import json
import requests

# Disable SSL warnings for self-signed certificates
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Configuration
ARGO_SERVER = os.environ.get('ARGO_SERVER', 'https://localhost:2746')
ARGO_TOKEN = os.environ.get('ARGO_TOKEN')
ARGO_NAMESPACE = os.environ.get('ARGO_NAMESPACE', 'default')

# Validate required environment variables
if not ARGO_TOKEN or ARGO_TOKEN == 'YOUR_TOKEN_HERE':
    print('Error: ARGO_TOKEN environment variable is required.', file=sys.stderr)
    print('Usage: ARGO_TOKEN=your_token python examples/submit_argo_workflow.py', file=sys.stderr)
    sys.exit(1)

# The workflow definition to submit
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
    """
    Submit a workflow to the Argo Workflows server.
    
    Returns:
        dict: The created workflow object
    """
    url = f'{ARGO_SERVER}/api/v1/workflows/{ARGO_NAMESPACE}'
    
    print(f'Submitting workflow to {url}...')
    
    try:
        response = requests.post(
            url,
            json=workflow,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {ARGO_TOKEN}'
            },
            verify=False  # Skip SSL certificate verification
        )
        
        response.raise_for_status()
        
        data = response.json()
        print('\n✓ Workflow submitted successfully!')
        print(f"  Workflow name: {data['metadata']['name']}")
        print(f"  Workflow UID: {data['metadata']['uid']}")
        print(f"  Namespace: {data['metadata']['namespace']}")
        print(f"  Status: {data.get('status', {}).get('phase', 'Pending')}")
        
        return data
    except requests.exceptions.HTTPError as error:
        print('\n✗ Error submitting workflow:')
        print(f'  Status: {error.response.status_code}')
        try:
            error_data = error.response.json()
            print(f"  Message: {error_data.get('message', error.response.text)}")
            if 'details' in error_data:
                print(f"  Details: {json.dumps(error_data['details'], indent=2)}")
        except json.JSONDecodeError:
            print(f'  Message: {error.response.text}')
        raise
    except requests.exceptions.RequestException as error:
        print('\n✗ Error submitting workflow:')
        print(f'  Error: {error}')
        raise


if __name__ == '__main__':
    try:
        submit_workflow()
        print('\nDone!')
        sys.exit(0)
    except Exception:
        print('\nFailed!')
        sys.exit(1)
