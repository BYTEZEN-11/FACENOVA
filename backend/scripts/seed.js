require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');
const SourceCache = require('../src/models/sourceCache.model');

const SAMPLE_DOMAINS = [
  { domain: 'reuters.com', credibilityScore: 96, reputation: 'trusted', sslValid: true },
  { domain: 'bbc.com', credibilityScore: 94, reputation: 'trusted', sslValid: true },
  { domain: 'apnews.com', credibilityScore: 95, reputation: 'trusted', sslValid: true },
  { domain: 'nytimes.com', credibilityScore: 91, reputation: 'trusted', sslValid: true },
  { domain: 'theguardian.com', credibilityScore: 90, reputation: 'trusted', sslValid: true },
  { domain: 'nasa.gov', credibilityScore: 98, reputation: 'trusted', sslValid: true },
  { domain: 'who.int', credibilityScore: 97, reputation: 'trusted', sslValid: true },
  { domain: 'theonion.com', credibilityScore: 75, reputation: 'satire', sslValid: true },
  { domain: 'babylonbee.com', credibilityScore: 72, reputation: 'satire', sslValid: true },
  { domain: 'infowars.com', credibilityScore: 10, reputation: 'unreliable', sslValid: true },
  { domain: 'naturalnews.com', credibilityScore: 8, reputation: 'unreliable', sslValid: true },
];

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(config.database.uri);
    console.log('✅ Connected');

    console.log('🌐 Seeding source credibility cache...');
    for (const d of SAMPLE_DOMAINS) {
      await SourceCache.updateOne(
        { domain: d.domain },
        { $set: d },
        { upsert: true }
      );
    }
    console.log(`   ${SAMPLE_DOMAINS.length} domains upserted`);

    console.log('\n✨ Seed complete!');
    console.log('\nNext steps:');
    console.log('   Register your account via: POST /api/auth/register');
    console.log('   Body: { "name": "Your Name", "email": "you@example.com", "password": "YourPassword1!" }');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
    process.exit(0);
  }
}

seed();
