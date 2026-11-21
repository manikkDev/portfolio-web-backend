import dns from 'node:dns';
import { MongoClient } from 'mongodb';
import env from './env.js';

// mongodb+srv needs an SRV lookup. Some machines hand Node a DNS server that refuses
// those ("querySrv ECONNREFUSED"); DNS_SERVERS overrides it. Leave unset in production.
if (env.dnsServers.length) dns.setServers(env.dnsServers);

// The driver connects on the first operation, so there is no startup ordering to manage.
const client = new MongoClient(env.mongoUri, { serverSelectionTimeoutMS: 8000 });

// Shares an Atlas cluster with another project; this database keeps the data separate.
export const db = client.db('portfolio');
