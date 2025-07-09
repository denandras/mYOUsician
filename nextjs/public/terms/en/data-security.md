# Data Storage and Security

Last Updated: July 9, 2025

## Overview

This document explains how mYOUsician stores, processes, and protects your data. As a platform that makes certain user information publicly accessible, we believe in transparency about our data handling practices.

## Where Your Data is Stored

### Cloud Infrastructure

- **Database Provider**: We use [Supabase](https://supabase.com/), a secure and GDPR-compliant database platform
- **Data Location**: All data is hosted on servers located within the European Union

### Local Development

- Limited data processing occurs on the developer's secure local development environment
- No production data is stored locally for extended periods

## Data Security Measures

### Authentication & Access

- **User Authentication**: Industry-standard authentication mechanisms protect user accounts
- **Authorization Controls**: Strict access controls limit who can modify data
- **Developer Access**: Only the platform developer has direct database access

### Encryption

- **Data in Transit**: All data transmitted between your browser and our servers is encrypted using HTTPS/TLS
- **Sensitive Data**: Passwords are hashed and never stored in plaintext
- **API Security**: All API requests require proper authentication

### Third-Party Security

- **Supabase Security**: Our database provider implements additional security measures including:
  - Database encryption
  - Network isolation
  - Regular security audits
  - Compliance with security standards

## Data Processing

### Public Data Processing

- Public profile information is processed and stored in a way that optimizes search functionality
- The database is structured to allow efficient filtering by musical genres, instruments, and other criteria
- Public data is cached temporarily to improve performance

### Private Data Processing

- Account management data is stored separately from public profile information
- Authentication data is handled through secure, established authentication flows

## Incident Response

In the unlikely event of a data breach:

1. We will identify and address the cause immediately
2. Users will be notified within 72 hours if personal data is affected
3. Appropriate authorities will be notified as required by law
4. Steps will be taken to prevent similar incidents

## Security Limitations

As a service operated by a solo developer:

- Resources for security monitoring are more limited than in large organizations
- We prioritize using established, secure platforms (Supabase, Next.js) to leverage their security expertise
- We follow security best practices but cannot guarantee absolute security

## Technical Implementation Details

- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (OAuth and email-based authentication)
- **Application Security**: Next.js security best practices
- **Infrastructure**: Serverless architecture with minimal attack surface

## Questions or Concerns

If you have questions about our data storage or security practices, please contact:
- Email: myousician.app@gmail.com

---

This document complements our Privacy Policy and Terms of Service, which provide additional information about how we collect and use your data.
