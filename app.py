# encoding=utf-8

import os

from static import Cling
from flask import Flask, abort, request, redirect, jsonify, make_response
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import func

from raven.contrib.flask import Sentry


app = Flask(__name__, static_folder='public')

app.config.update(
    DEBUG=os.environ.get('DEBUG') == 'true',
    SQLALCHEMY_DATABASE_URI=os.environ['DATABASE_URL'],
    SENTRY_DSN='https://8934ede82ce84c22a1b4d1f2d0707bfc:1c5fdc748a52486fafcab1b28d3e550f@app.getsentry.com/2035',
    HTML_ROOT='public',
)

db = SQLAlchemy(app)
sentry = Sentry(app)


class Stall(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    created = db.Column(db.DateTime, server_default=func.now())
    entity = db.Column(db.String, nullable=False)
    description = db.Column(db.Text, nullable=False)
    email = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)

    @property
    def json(self):
        return dict(
            entity=self.entity,
            description=self.description,
            email=self.email,
            name=self.name,
        )


@app.route('/', methods=['GET'])
def index():
    return redirect('/index.html')


@app.route('/stalls', methods=['GET'])
def stalls():
    stalls = Stall.query.order_by(Stall.created)
    return jsonify(stalls=[s.json for s in stalls])


@app.route('/stalls', methods=['POST'])
def stalls_add():
    try:
        stall = Stall(
            entity=request.json['entity'],
            description=request.json['description'],
            email=request.json['email'],
            name=request.json['name'],
        )
        assert stall.description, {'description': 'Lýsingu vantar'}
        assert stall.email, {'email': 'Netfang vantar'}
        assert stall.name, {'name': 'Nafn vantar'}
    except KeyError, err:
        abort(make_response(jsonify(errors=err), 422, {}))
    except AssertionError, err:
        abort(make_response(jsonify(errors=err.message), 422, {}))

    db.session.add(stall)
    db.session.commit()
    return make_response(jsonify(**stall.json), 201)


class StaticFallback(Cling):

    def __init__(self, app, root):
        self.app = app
        self.root = root

    def __call__(self, environ, start_response):
        """Respond to a request when called in the usual WSGI way."""
        path_info = environ.get('PATH_INFO', '')
        full_path = self._full_path(path_info)
        if os.path.isfile(full_path):
            return super(StaticFallback, self).__call__(environ, start_response)
        return self.app(environ, start_response)


app.wsgi_app = StaticFallback(app.wsgi_app, app.config['HTML_ROOT'])

if __name__ == '__main__':
    port = os.environ.get('PORT', 5000)
    db.create_all()
    app.run(host='0.0.0.0', port=int(port), debug=True)
