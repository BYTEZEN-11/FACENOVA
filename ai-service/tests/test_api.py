import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope='module')
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    res = client.get('/health')
    assert res.status_code == 200
    body = res.json()
    assert body.get('status') == 'healthy'


def test_root(client):
    res = client.get('/')
    assert res.status_code == 200
    body = res.json()
    assert 'service' in body or 'message' in body


def test_text_analyze_auth_required(client):
    res = client.post('/api/v1/analyze/text', json={'text': 'hello world'})
    assert res.status_code in (400, 401, 403, 422)


def test_text_analyze_with_api_key(client):
    from app.core.config import get_settings

    settings = get_settings()
    headers = {'X-API-Key': settings.api_key}
    res = client.post(
        '/api/v1/analyze/text',
        json={'text': 'The Federal Reserve announced a small rate hike today.'},
        headers=headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert body.get('success') is True
    data = body['data']
    assert 'analysis' in data
    assert 'trust_score' in data['analysis']
    assert data['analysis']['classification'] in ('real', 'fake', 'suspicious')


def test_text_analyze_short_text_rejected(client):
    from app.core.config import get_settings

    settings = get_settings()
    headers = {'X-API-Key': settings.api_key}
    res = client.post(
        '/api/v1/analyze/text',
        json={'text': 'hi'},
        headers=headers,
    )
    assert res.status_code in (400, 422)
