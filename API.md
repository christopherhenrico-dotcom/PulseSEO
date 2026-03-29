# PulseSEO API Documentation

## Overview

The PulseSEO API provides programmatic access to all platform features. This RESTful API enables you to manage audits, clients, reports, team members, and billing programmatically.

**Base URL:** `https://api.pulseseo.com/api`

## Authentication

All API requests require authentication using JWT tokens.

### Obtaining Tokens

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
```

Response:
```json
{
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Using Tokens

Include the access token in the Authorization header:

```http
Authorization: Bearer your-access-token
```

### Refreshing Tokens

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

## Rate Limits

- **Free Plan:** 100 requests/15 minutes
- **Pro Plan:** 1,000 requests/15 minutes
- **Enterprise Plan:** 10,000 requests/15 minutes

## Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new account |
| POST | `/auth/login` | Login |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |
| PATCH | `/auth/me` | Update profile |
| POST | `/auth/change-password` | Change password |

### Audits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/audits` | List audits |
| GET | `/audits/:id` | Get audit details |
| POST | `/audits` | Create audit |
| POST | `/audits/bulk` | Create bulk audits |
| DELETE | `/audits/:id` | Delete audit |
| GET | `/audits/export/csv` | Export to CSV |
| GET | `/audits/export/json` | Export to JSON |
| GET | `/audits/stats/summary` | Get statistics |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List clients |
| GET | `/clients/:id` | Get client details |
| POST | `/clients` | Create client |
| PATCH | `/clients/:id` | Update client |
| DELETE | `/clients/:id` | Delete client |

### Team Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/team/members` | List team members |
| POST | `/team/invite` | Invite team member |
| GET | `/team/invitations` | List pending invitations |
| DELETE | `/team/invitations/:id` | Cancel invitation |
| PATCH | `/team/members/:id/role` | Update member role |
| DELETE | `/team/members/:id` | Remove team member |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports` | List reports |
| GET | `/reports/:id` | Get report |
| POST | `/reports/generate` | Generate report |
| GET | `/reports/:id/download` | Download report |
| POST | `/reports/schedule` | Schedule recurring report |
| GET | `/reports/scheduled/list` | List scheduled reports |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/plans` | List available plans |
| GET | `/billing/subscription` | Get current subscription |
| POST | `/billing/checkout` | Create checkout session |
| POST | `/billing/portal` | Create billing portal session |
| GET | `/billing/invoices` | List invoices |
| GET | `/billing/usage` | Get usage statistics |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get settings |
| PATCH | `/settings/branding` | Update branding |
| PATCH | `/settings/notifications` | Update notifications |
| GET | `/settings/api` | Get API settings |
| POST | `/settings/api/keys` | Generate API key |
| DELETE | `/settings/api/keys/:id` | Revoke API key |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Get dashboard analytics |
| GET | `/analytics/trends` | Get trends data |
| GET | `/analytics/compare/:id1/:id2` | Compare audits |
| GET | `/analytics/categories` | Get category breakdown |
| GET | `/analytics/export` | Export analytics |

### Scheduled Audits

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scheduled` | List scheduled audits |
| GET | `/scheduled/:id` | Get scheduled audit |
| POST | `/scheduled` | Create scheduled audit |
| PATCH | `/scheduled/:id` | Update scheduled audit |
| DELETE | `/scheduled/:id` | Delete scheduled audit |
| POST | `/scheduled/:id/toggle` | Toggle active status |

## Webhooks

Configure webhooks to receive real-time notifications about events.

### Available Events

- `audit.created` - New audit started
- `audit.completed` - Audit analysis complete
- `report.generated` - Report ready for download
- `team.member.invited` - Team member invited
- `team.member.joined` - Team member joined
- `billing.payment.succeeded` - Payment successful
- `billing.payment.failed` - Payment failed

### Webhook Payload

```json
{
  "event": "audit.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "auditId": "aud_abc123",
    "businessName": "Example Business",
    "seoScore": 72
  }
}
```

## SDKs & Examples

### JavaScript/TypeScript

```typescript
import { PulseSEO } from '@pulseseo/sdk';

const client = new PulseSEO({
  apiKey: 'your-api-key'
});

// Create an audit
const audit = await client.audits.create({
  business: {
    name: 'Example Business',
    category: 'Restaurant',
    location: 'New York, NY',
    website: 'https://example.com'
  }
});

// Get audit results
const results = await client.audits.get(audit.id);
```

### Python

```python
from pulseseo import PulseSEO

client = PulseSEO(api_key='your-api-key')

# Create an audit
audit = client.audits.create(
    business={
        'name': 'Example Business',
        'category': 'Restaurant',
        'location': 'New York, NY',
        'website': 'https://example.com'
    }
)

# Get audit results
results = client.audits.get(audit.id)
```

### cURL

```bash
# Create an audit
curl -X POST https://api.pulseseo.com/api/audits \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business": {
      "name": "Example Business",
      "category": "Restaurant",
      "location": "New York, NY"
    }
  }'

# Get audit list
curl https://api.pulseseo.com/api/audits \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Error Handling

All errors return a consistent format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Support

For API support, contact: api-support@pulseseo.com
