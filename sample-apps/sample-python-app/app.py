from flask import Flask, jsonify, request
import os
import time
import psutil
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Hello from Sample Python Flask App!',
        'timestamp': datetime.now().isoformat(),
        'environment': os.environ.get('FLASK_ENV', 'development'),
        'version': '1.0.0'
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'OK',
        'uptime': time.time() - psutil.boot_time(),
        'memory': {
            'total': psutil.virtual_memory().total,
            'available': psutil.virtual_memory().available,
            'percent': psutil.virtual_memory().percent
        },
        'cpu_percent': psutil.cpu_percent(),
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/data')
def get_data():
    return jsonify({
        'data': [
            {'id': 1, 'value': 'Sample data 1', 'category': 'A'},
            {'id': 2, 'value': 'Sample data 2', 'category': 'B'},
            {'id': 3, 'value': 'Sample data 3', 'category': 'A'}
        ],
        'count': 3,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/data', methods=['POST'])
def create_data():
    data = request.get_json()
    return jsonify({
        'message': 'Data created successfully',
        'data': {
            'id': int(time.time()),
            **data
        },
        'timestamp': datetime.now().isoformat()
    }), 201

@app.route('/api/stats')
def get_stats():
    return jsonify({
        'system': {
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'disk_usage': psutil.disk_usage('/').percent
        },
        'flask': {
            'debug': app.debug,
            'testing': app.testing
        },
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)