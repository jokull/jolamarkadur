# encoding=utf-8

import os

from static import Cling
from flask import Flask, abort, request, redirect, jsonify, make_response
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import func

app = Flask(__name__, static_folder='public')

app.config.update(
    DEBUG=os.environ.get('DEBUG') == 'true',
    SQLALCHEMY_DATABASE_URI=os.environ['HEROKU_POSTGRESQL_GREEN_URL'],
    HTML_ROOT='public',
)

db = SQLAlchemy(app)


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
    stalls = Stall.query.order_by(Stall.created.desc())
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
    except KeyError, e:
        print e
        abort(make_response(unicode(e), 422, {}))

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
