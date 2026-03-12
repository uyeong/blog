#!/usr/bin/env node
import { google } from 'googleapis';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = '/home/uyeong/Projects/blog';
const OUT_PATH = path.join(ROOT, 'source/_data/ga_views.json');

const propertyId = process.env.GA4_PROPERTY_ID || process.env.GA_PROPERTY_ID;
const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;

async function writeEmpty(reason) {
  const payload = {
    source: 'ga4',
    updatedAt: new Date().toISOString(),
    reason,
    pageViews: {}
  };
  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`[ga-views] wrote empty data: ${reason}`);
}

if (!propertyId) {
  await writeEmpty('missing GA4_PROPERTY_ID');
  process.exit(0);
}

if (!keyFile) {
  await writeEmpty('missing GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(0);
}

try {
  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/analytics.readonly']
  });

  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  const report = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate: '365daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 10000
    }
  });

  const rows = report.data.rows || [];
  const pageViews = {};

  for (const row of rows) {
    const pagePath = row.dimensionValues?.[0]?.value;
    const views = Number(row.metricValues?.[0]?.value || '0');
    if (!pagePath || Number.isNaN(views)) continue;
    pageViews[pagePath] = views;
  }

  const payload = {
    source: 'ga4',
    updatedAt: new Date().toISOString(),
    propertyId: String(propertyId),
    pageViews
  };

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`[ga-views] synced ${Object.keys(pageViews).length} page paths`);
} catch (error) {
  await writeEmpty(`sync failed: ${error.message}`);
  process.exit(0);
}
