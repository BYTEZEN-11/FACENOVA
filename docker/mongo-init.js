db = db.getSiblingDB('fake_news_db');

db.createCollection('users');
db.createCollection('reports');
db.createCollection('sourcecaches');

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

db.reports.createIndex({ userId: 1, createdAt: -1 });
db.reports.createIndex({ inputType: 1, 'analysis.classification': 1 });
db.reports.createIndex({ createdAt: -1 });
db.reports.createIndex({ inputContent: 'text', tags: 'text' });

db.sourcecaches.createIndex({ domain: 1 }, { unique: true });
db.sourcecaches.createIndex(
  { lastChecked: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
);

print('✅ fake_news_db initialized with indexes');
