# vSphere Capacity Manager Console Plugin - Installation Guide

## Prerequisites

### OpenShift Cluster Requirements

- OpenShift 4.12 or later
- Cluster admin access
- vSphere Capacity Manager operator already deployed
- Container registry access (for pushing custom images)

### Local Development Requirements

- Node.js 18+ and npm 9+
- `oc` CLI tool
- `kubectl` (optional)
- Container engine (podman or docker)

## Installation Methods

### Method 1: Deploy Pre-built Image (Recommended)

If using the pre-built image from quay.io:

```bash
# 1. Apply the plugin manifests
oc apply -k console-plugin/manifests/

# 2. Enable the plugin in the OpenShift Console
oc patch consoles.operator.openshift.io cluster \
  --type merge \
  --patch '{"spec":{"plugins":["vsphere-capacity-manager"]}}'

# 3. Verify plugin is loaded
oc get consoleplugins
oc get deployment -n vsphere-infra-helpers vsphere-capacity-manager-console-plugin

# 4. Wait for console pods to restart
oc get pods -n openshift-console -w
```

### Method 2: Build and Deploy Custom Image

If you want to build your own image:

```bash
# 1. Navigate to the repository root
cd /path/to/vsphere-capacity-manager

# 2. Set your image repository
export PLUGIN_IMAGE=quay.io/your-org/vcm-console-plugin:latest

# 3. Install dependencies and build
make plugin-install
make plugin-build

# 4. Build and push container image
make plugin-push

# 5. Update the manifests with your image
cd console-plugin/manifests
kustomize edit set image \
  quay.io/openshift-splat-team/vsphere-capacity-manager-console-plugin=$PLUGIN_IMAGE

# 6. Deploy the plugin
cd ../..
make deploy-plugin

# 7. Enable the plugin
oc patch consoles.operator.openshift.io cluster \
  --type merge \
  --patch '{"spec":{"plugins":["vsphere-capacity-manager"]}}'
```

### Method 3: Local Development Mode

For local development and testing:

```bash
# 1. Install dependencies
cd console-plugin
npm install

# 2. Start development server
npm start

# 3. Access at http://localhost:9000
# Note: You'll need to configure the OpenShift Console to connect to localhost:9000
```

## Verifying Installation

### Check Plugin Status

```bash
# Verify ConsolePlugin resource is created
oc get consoleplugin vsphere-capacity-manager -o yaml

# Check if plugin is enabled
oc get consoles.operator.openshift.io cluster -o jsonpath='{.spec.plugins}'

# Verify deployment is running
oc get deployment -n vsphere-infra-helpers \
  vsphere-capacity-manager-console-plugin

# Check pod status
oc get pods -n vsphere-infra-helpers \
  -l app=vsphere-capacity-manager-console-plugin

# View logs
oc logs -n vsphere-infra-helpers \
  -l app=vsphere-capacity-manager-console-plugin
```

### Access the Plugin in Console

1. Log into the OpenShift Console
2. Wait for the console to reload (may take 30-60 seconds)
3. Look for "vSphere Capacity" in the left navigation menu
4. Click to expand and see:
   - Dashboard
   - Pools
   - Leases
   - Networks

### Test Plugin Functionality

```bash
# Create a test pool
oc apply -f - <<EOF
apiVersion: vspherecapacitymanager.splat.io/v1
kind: Pool
metadata:
  name: test-pool
  namespace: vsphere-infra-helpers
spec:
  name: test-pool-1
  region: us-east-1
  zone: zone-a
  server: vcenter.example.com
  vcpus: 100
  memory: 512
  storage: 1000
  topology:
    datacenter: DC1
    computeCluster: Cluster1
    datastore: datastore1
    networks:
      - VM Network
EOF

# Navigate to Pools in the console UI
# Verify the test pool appears in the list
```

## Configuration

### Customizing the Plugin

#### Update Image Repository

Edit `console-plugin/manifests/kustomization.yaml`:

```yaml
images:
  - name: quay.io/openshift-splat-team/vsphere-capacity-manager-console-plugin
    newName: quay.io/your-org/vcm-console-plugin
    newTag: v1.0.0
```

#### Adjust Resource Limits

Edit `console-plugin/manifests/deployment.yaml`:

```yaml
resources:
  requests:
    cpu: 20m        # Increase if needed
    memory: 100Mi   # Increase if needed
  limits:
    cpu: 200m
    memory: 256Mi
```

#### Configure Prometheus Proxy

The plugin uses Prometheus for metrics. Verify the service name in `console-plugin/manifests/console-plugin.yaml`:

```yaml
spec:
  proxy:
    - type: Service
      alias: prometheus-tenancy
      authorize: true
      service:
        name: metrics  # Must match your VCM metrics service
        namespace: vsphere-infra-helpers
        port: 8080
```

### TLS Certificate

The plugin uses OpenShift's service serving certificate:

```yaml
# This annotation in service.yaml triggers cert creation
annotations:
  service.beta.openshift.io/serving-cert-secret-name: vsphere-capacity-manager-console-plugin-cert
```

The certificate is automatically managed by OpenShift and rotated before expiration.

## Troubleshooting

### Plugin Not Appearing in Console

**Symptoms**: "vSphere Capacity" menu item not visible

**Solutions**:
1. Verify plugin is enabled:
   ```bash
   oc get consoles.operator.openshift.io cluster -o yaml | grep -A5 plugins
   ```

2. Check console pods have restarted:
   ```bash
   oc get pods -n openshift-console
   # Pods should be recently created
   ```

3. Force console pod restart:
   ```bash
   oc delete pods -n openshift-console -l app=console
   ```

4. Check browser console for errors (F12)

### Plugin Deployment Issues

**Symptoms**: Deployment pods not running or crashing

**Solutions**:
1. Check deployment status:
   ```bash
   oc describe deployment -n vsphere-infra-helpers \
     vsphere-capacity-manager-console-plugin
   ```

2. View pod logs:
   ```bash
   oc logs -n vsphere-infra-helpers \
     -l app=vsphere-capacity-manager-console-plugin
   ```

3. Check for image pull errors:
   ```bash
   oc get events -n vsphere-infra-helpers --sort-by='.lastTimestamp'
   ```

4. Verify service certificate was created:
   ```bash
   oc get secret -n vsphere-infra-helpers \
     vsphere-capacity-manager-console-plugin-cert
   ```

### Dashboard Shows No Metrics

**Symptoms**: Dashboard loads but shows "No data available"

**Solutions**:
1. Verify VCM operator is running and exposing metrics:
   ```bash
   oc get pods -n vsphere-infra-helpers
   oc get svc -n vsphere-infra-helpers metrics
   ```

2. Test Prometheus metrics endpoint:
   ```bash
   oc port-forward -n vsphere-infra-helpers svc/metrics 8080:8080
   curl http://localhost:8080/metrics | grep pool_vcpus
   ```

3. Check ConsolePlugin proxy configuration:
   ```bash
   oc get consoleplugin vsphere-capacity-manager -o yaml
   ```

4. Verify there are pools/leases in the cluster:
   ```bash
   oc get pools -n vsphere-infra-helpers
   oc get leases -n vsphere-infra-helpers
   ```

### Permission Errors

**Symptoms**: "Forbidden" or "Unauthorized" errors

**Solutions**:
1. Verify RBAC is configured correctly:
   ```bash
   # The VCM operator's RBAC should allow viewing resources
   oc get clusterrole | grep vcm
   oc get clusterrolebinding | grep vcm
   ```

2. Check user has permission to view CRDs:
   ```bash
   oc auth can-i get pools.vspherecapacitymanager.splat.io
   oc auth can-i get leases.vspherecapacitymanager.splat.io
   oc auth can-i get networks.vspherecapacitymanager.splat.io
   ```

3. Grant appropriate permissions:
   ```bash
   # For cluster-wide read access
   oc adm policy add-cluster-role-to-user view <username>
   
   # For namespace-specific access
   oc adm policy add-role-to-user view <username> -n vsphere-infra-helpers
   ```

### Plugin Fails to Load Assets

**Symptoms**: Browser console shows 404 errors for .js files

**Solutions**:
1. Verify nginx is serving files correctly:
   ```bash
   oc exec -n vsphere-infra-helpers \
     deployment/vsphere-capacity-manager-console-plugin \
     -- ls -la /usr/share/nginx/html
   ```

2. Check nginx configuration:
   ```bash
   oc exec -n vsphere-infra-helpers \
     deployment/vsphere-capacity-manager-console-plugin \
     -- cat /etc/nginx/nginx.conf
   ```

3. Verify service and route are correct:
   ```bash
   oc get svc -n vsphere-infra-helpers vsphere-capacity-manager-console-plugin
   oc describe consoleplugin vsphere-capacity-manager
   ```

## Uninstalling

### Remove the Plugin

```bash
# 1. Disable the plugin in console
oc patch consoles.operator.openshift.io cluster \
  --type json \
  --patch '[{"op": "remove", "path": "/spec/plugins", "value": ["vsphere-capacity-manager"]}]'

# 2. Delete plugin resources
oc delete -k console-plugin/manifests/

# 3. Verify removal
oc get consoleplugin
oc get pods -n vsphere-infra-helpers -l app=vsphere-capacity-manager-console-plugin
```

## Upgrading

### Upgrade to New Version

```bash
# 1. Build new image with version tag
export PLUGIN_IMAGE=quay.io/your-org/vcm-console-plugin:v1.1.0
make plugin-push

# 2. Update deployment image
oc set image deployment/vsphere-capacity-manager-console-plugin \
  -n vsphere-infra-helpers \
  vsphere-capacity-manager-console-plugin=$PLUGIN_IMAGE

# 3. Verify rollout
oc rollout status deployment/vsphere-capacity-manager-console-plugin \
  -n vsphere-infra-helpers

# 4. Console will reload automatically
```

## Security Considerations

### Network Policies

If using NetworkPolicies, ensure the console can reach the plugin:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-console-to-plugin
  namespace: vsphere-infra-helpers
spec:
  podSelector:
    matchLabels:
      app: vsphere-capacity-manager-console-plugin
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: openshift-console
    ports:
    - protocol: TCP
      port: 9443
```

### Pod Security

The plugin deployment uses restricted security context:
- `runAsNonRoot: true`
- `allowPrivilegeEscalation: false`
- Capabilities dropped: ALL
- seccompProfile: RuntimeDefault

This complies with OpenShift's restricted Pod Security Standard.

## Support

For issues and questions:
- GitHub Issues: https://github.com/openshift-splat-team/vsphere-capacity-manager/issues
- Documentation: See console-plugin/README.md
- Operator Logs: `oc logs -n vsphere-infra-helpers deployment/vsphere-capacity-manager`

## Next Steps

- Read the [User Guide](USER_GUIDE.md) for usage instructions
- See [TESTING.md](TESTING.md) for testing procedures
- Review [ACCESSIBILITY.md](ACCESSIBILITY.md) for accessibility features
