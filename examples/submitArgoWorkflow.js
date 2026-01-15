/**
 * Argo Workflow Submission Example
 * 
 * This script demonstrates how to submit a workflow to an Argo Workflows server.
 * 
 * Usage:
 *   node examples/submitArgoWorkflow.js
 * 
 * Environment Variables:
 *   ARGO_SERVER - Argo Workflows server URL (default: https://localhost:2746)
 *   ARGO_TOKEN - Bearer token for authentication
 *   ARGO_NAMESPACE - Kubernetes namespace (default: default)
 */

const axios = require('axios');
const https = require('https');

// Configuration
const ARGO_SERVER = process.env.ARGO_SERVER || 'https://localhost:2746';
const ARGO_TOKEN = process.env.ARGO_TOKEN;
const ARGO_NAMESPACE = process.env.ARGO_NAMESPACE || 'default';

// Validate required environment variables
if (!ARGO_TOKEN || ARGO_TOKEN === 'YOUR_TOKEN_HERE') {
  console.error('Error: ARGO_TOKEN environment variable is required.');
  console.error('Usage: ARGO_TOKEN=your_token node examples/submitArgoWorkflow.js');
  process.exit(1);
}

// The workflow definition to submit
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
// WARNING: This is insecure and should only be used in development
// In production, use proper SSL certificates and remove this configuration
const agent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Submit a workflow to the Argo Workflows server
 * @returns {Promise<Object>} The created workflow object
 */
async function submitWorkflow() {
  const url = `${ARGO_SERVER}/api/v1/workflows/${ARGO_NAMESPACE}`;
  
  console.log(`Submitting workflow to ${url}...`);
  
  try {
    const response = await axios.post(url, workflow, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARGO_TOKEN}`
      },
      httpsAgent: agent
    });

    console.log('\n✓ Workflow submitted successfully!');
    console.log(`  Workflow name: ${response.data.metadata.name}`);
    console.log(`  Workflow UID: ${response.data.metadata.uid}`);
    console.log(`  Namespace: ${response.data.metadata.namespace}`);
    console.log(`  Status: ${response.data.status?.phase || 'Pending'}`);
    
    return response.data;
  } catch (error) {
    console.error('\n✗ Error submitting workflow:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data?.message || error.response.statusText}`);
      if (error.response.data?.details) {
        console.error(`  Details: ${JSON.stringify(error.response.data.details, null, 2)}`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('  No response received from server');
      console.error(`  Error: ${error.message}`);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error(`  Error: ${error.message}`);
    }
    throw error;
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  submitWorkflow()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch(() => {
      console.log('\nFailed!');
      process.exit(1);
    });
}

module.exports = { submitWorkflow };
