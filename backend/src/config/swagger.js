const YAML = require('yamljs');
const path = require('path');

// Load OpenAPI specification
const openApiDocument = YAML.load(path.join(__dirname, '../../../..', 'openapi.yaml'));

// Update the server URL to match our backend
openApiDocument.servers = [
    {
        url: 'http://localhost:8080/api',
        description: 'Local development server'
    }
];

module.exports = openApiDocument;
