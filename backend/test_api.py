#!/usr/bin/env python3
"""
Comprehensive API testing script for RTSP Overlay Backend
Tests all endpoints and MongoDB integration
"""
import requests
import json
import time
import sys

BASE_URL = 'http://localhost:5001'
API_URL = f'{BASE_URL}/api'

def print_test(test_name):
    """Print test header"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print('='*60)

def test_health():
    """Test health check endpoint"""
    print_test("Health Check")
    try:
        response = requests.get(f'{BASE_URL}/health', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        assert response.json()['status'] == 'healthy'
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_get_overlays_empty():
    """Test getting overlays when none exist"""
    print_test("Get Overlays (Empty)")
    try:
        response = requests.get(f'{API_URL}/overlays', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert 'overlays' in data
        assert isinstance(data['overlays'], list)
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_create_text_overlay():
    """Test creating a text overlay"""
    print_test("Create Text Overlay")
    try:
        payload = {
            'type': 'text',
            'content': 'Test Overlay',
            'position': {'x': 100, 'y': 100},
            'size': {'width': 200, 'height': 100}
        }
        response = requests.post(f'{API_URL}/overlays', json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 201
        data = response.json()
        assert data['success'] == True
        assert 'overlay' in data
        assert data['overlay']['type'] == 'text'
        assert data['overlay']['content'] == 'Test Overlay'
        assert 'id' in data['overlay']
        print("✅ PASSED")
        return data['overlay']['id']
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return None

def test_create_image_overlay():
    """Test creating an image overlay"""
    print_test("Create Image Overlay")
    try:
        payload = {
            'type': 'image',
            'content': 'https://via.placeholder.com/150',
            'position': {'x': 300, 'y': 200},
            'size': {'width': 150, 'height': 150}
        }
        response = requests.post(f'{API_URL}/overlays', json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 201
        data = response.json()
        assert data['success'] == True
        assert 'overlay' in data
        assert data['overlay']['type'] == 'image'
        print("✅ PASSED")
        return data['overlay']['id']
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return None

def test_get_overlay_by_id(overlay_id):
    """Test getting a specific overlay"""
    print_test(f"Get Overlay By ID: {overlay_id}")
    try:
        response = requests.get(f'{API_URL}/overlays/{overlay_id}', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert data['overlay']['id'] == overlay_id
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_get_all_overlays():
    """Test getting all overlays"""
    print_test("Get All Overlays")
    try:
        response = requests.get(f'{API_URL}/overlays', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert 'overlays' in data
        assert len(data['overlays']) >= 2  # Should have at least 2 from previous tests
        print(f"Found {len(data['overlays'])} overlays")
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_update_overlay(overlay_id):
    """Test updating an overlay"""
    print_test(f"Update Overlay: {overlay_id}")
    try:
        payload = {
            'position': {'x': 500, 'y': 300},
            'size': {'width': 250, 'height': 150},
            'content': 'Updated Content'
        }
        response = requests.put(f'{API_URL}/overlays/{overlay_id}', json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert data['overlay']['position']['x'] == 500
        assert data['overlay']['content'] == 'Updated Content'
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_delete_overlay(overlay_id):
    """Test deleting an overlay"""
    print_test(f"Delete Overlay: {overlay_id}")
    try:
        response = requests.delete(f'{API_URL}/overlays/{overlay_id}', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_stream_with_hls():
    """Test starting stream with HLS URL"""
    print_test("Start Stream (HLS)")
    try:
        payload = {
            'rtsp_url': 'http://localhost:5001/static/test_stream/playlist.m3u8'
        }
        response = requests.post(f'{API_URL}/stream/start', json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        assert 'hls_url' in data
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_stream_status():
    """Test stream status endpoint"""
    print_test("Stream Status")
    try:
        response = requests.get(f'{API_URL}/stream/status', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def test_stream_stop():
    """Test stopping stream"""
    print_test("Stop Stream")
    try:
        response = requests.post(f'{API_URL}/stream/stop', timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        assert response.status_code == 200
        data = response.json()
        assert data['success'] == True
        print("✅ PASSED")
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("RTSP OVERLAY BACKEND - API TEST SUITE")
    print("="*60)
    
    results = {
        'passed': 0,
        'failed': 0,
        'total': 0
    }
    
    # Check if server is running
    print("\nChecking if backend server is running...")
    try:
        requests.get(f'{BASE_URL}/health', timeout=2)
        print("✅ Backend server is running")
    except:
        print("❌ Backend server is NOT running!")
        print("Please start the server with: python app.py")
        sys.exit(1)
    
    # Run tests in sequence
    tests = []
    
    # Basic tests
    tests.append(('Health Check', test_health()))
    tests.append(('Get Empty Overlays', test_get_overlays_empty()))
    
    # CRUD tests
    text_overlay_id = test_create_text_overlay()
    tests.append(('Create Text Overlay', text_overlay_id is not None))
    
    image_overlay_id = test_create_image_overlay()
    tests.append(('Create Image Overlay', image_overlay_id is not None))
    
    if text_overlay_id:
        tests.append(('Get Overlay By ID', test_get_overlay_by_id(text_overlay_id)))
        tests.append(('Update Overlay', test_update_overlay(text_overlay_id)))
    
    tests.append(('Get All Overlays', test_get_all_overlays()))
    
    # Delete tests
    if text_overlay_id:
        tests.append(('Delete Text Overlay', test_delete_overlay(text_overlay_id)))
    if image_overlay_id:
        tests.append(('Delete Image Overlay', test_delete_overlay(image_overlay_id)))
    
    # Stream tests
    tests.append(('Start Stream (HLS)', test_stream_with_hls()))
    tests.append(('Stream Status', test_stream_status()))
    tests.append(('Stop Stream', test_stream_stop()))
    
    # Calculate results
    for name, result in tests:
        results['total'] += 1
        if result:
            results['passed'] += 1
        else:
            results['failed'] += 1
    
    # Print summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    print(f"Total Tests: {results['total']}")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total']*100):.1f}%")
    print("="*60)
    
    if results['failed'] == 0:
        print("\n🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"\n⚠️  {results['failed']} test(s) failed")
        sys.exit(1)

if __name__ == '__main__':
    main()
