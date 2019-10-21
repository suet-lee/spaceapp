#!/bin/bash

export FLASK_APP=__init__.py
export FLASK_ENV=development

flask run --host=0.0.0.0 --port=8888
